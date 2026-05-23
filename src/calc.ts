/**
 * calc.ts — HyperFormula bridge for live calculation preview.
 *
 * Design goals:
 * - Lazy-loads HyperFormula via dynamic import() so forms without calculations
 *   pay zero bundle cost (HF is ~250 KB gzipped).
 * - Memoises the compiled (fieldId → A1 cell) map and HF instance keyed by
 *   `${form_id}@${version}`. Re-creates on spec change.
 * - Multi-select fields expose both a `.length` cell and per-option boolean
 *   cells (`<fieldId>.<optionValue>`).
 * - Pure functions; no React dependency.
 */

import type { FormSpec, FormField, MultiselectField } from './types.js'

// ── Types ─────────────────────────────────────────────────────────────────────

export type CalcResults = Record<string, number | string | null>

interface CellMap {
  /** fieldId → A1 address (e.g. "A1") */
  fields: Map<string, string>
  /** synthetic cell key → A1 address (e.g. "fld_ms.optA" → "A5") */
  synthetic: Map<string, string>
  /** total number of cells allocated */
  size: number
}

interface HFInstance {
  hf: import('hyperformula').HyperFormula
  sheetId: number
  cellMap: CellMap
  specKey: string
}

// ── Internal cache ────────────────────────────────────────────────────────────

let hfCache: HFInstance | null = null

function specKey(spec: FormSpec): string {
  return `${spec.id}@${spec.version}`
}

// ── Cell-map builder ──────────────────────────────────────────────────────────

function buildCellMap(spec: FormSpec): CellMap {
  const fields = new Map<string, string>()
  const synthetic = new Map<string, string>()
  let idx = 0 // row index (0-based); each cell is col 0, row idx → A(idx+1)

  function toA1(rowIndex: number): string {
    // Column A only; row is 1-based in A1 notation.
    return `A${rowIndex + 1}`
  }

  for (const page of spec.pages) {
    for (const field of page.fields) {
      fields.set(field.id, toA1(idx))
      idx++

      // Multi-select: extra cells for .length and per-option booleans
      if (field.type === 'multiselect') {
        const msField = field as MultiselectField
        const lenKey = `${field.id}.length`
        synthetic.set(lenKey, toA1(idx))
        idx++
        for (const opt of msField.options) {
          synthetic.set(`${field.id}.${opt.value}`, toA1(idx))
          idx++
        }
      }
    }
  }

  return { fields, synthetic, size: idx }
}

// ── A1-ref formula rewriter ───────────────────────────────────────────────────

/**
 * Rewrites a formula that uses field IDs into one that uses A1 refs.
 * e.g. `SUM(fld_qty, fld_price)` → `SUM(A1, A3)`
 *
 * Simple token-based replace: longest keys first to avoid partial matches.
 */
function rewriteFormula(formula: string, cellMap: CellMap): string {
  // Build a combined replacement map sorted longest-key-first.
  const replacements: Array<[string, string]> = []
  for (const [key, ref] of cellMap.fields) replacements.push([key, ref])
  for (const [key, ref] of cellMap.synthetic) replacements.push([key, ref])
  replacements.sort((a, b) => b[0].length - a[0].length)

  let out = formula
  for (const [key, ref] of replacements) {
    // Word-boundary-style replace: only match when not adjacent to \w chars.
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    out = out.replace(new RegExp(`(?<![\\w.])${escaped}(?![\\w.])`, 'g'), ref)
  }
  return out
}

// ── Value → cell data ────────────────────────────────────────────────────────

type CellValue = string | number | boolean | null

/**
 * Converts a form field value to a flat array of [A1, value] pairs,
 * including synthetic cells for multi-select fields.
 */
function fieldValueToCells(
  field: FormField,
  value: unknown,
  cellMap: CellMap,
): Array<[string, CellValue]> {
  const pairs: Array<[string, CellValue]> = []
  const mainRef = cellMap.fields.get(field.id)
  if (!mainRef) return pairs

  if (field.type === 'multiselect') {
    const selected: string[] = Array.isArray(value) ? (value as string[]) : []
    // Main cell: number of selections
    pairs.push([mainRef, selected.length])

    const lenRef = cellMap.synthetic.get(`${field.id}.length`)
    if (lenRef) pairs.push([lenRef, selected.length])

    const msField = field as MultiselectField
    for (const opt of msField.options) {
      const optRef = cellMap.synthetic.get(`${field.id}.${opt.value}`)
      if (optRef) pairs.push([optRef, selected.includes(opt.value) ? 1 : 0])
    }
  } else if (field.type === 'checkbox') {
    pairs.push([mainRef, value === true || value === 'true' ? 1 : 0])
  } else if (field.type === 'number') {
    const n = Number(value)
    pairs.push([mainRef, isNaN(n) ? null : n])
  } else {
    pairs.push([mainRef, value == null ? null : String(value)])
  }

  return pairs
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Compute all `spec.calculations` against the current `values`.
 *
 * Returns a map of `{ [calcId]: result }`.
 * Returns `{}` synchronously (before HF loads) or when spec has no calculations.
 *
 * The returned promise resolves to the same map after the first lazy load;
 * subsequent calls with the same spec key reuse the cached HF instance.
 */
export async function computeCalculations(
  spec: FormSpec,
  values: Record<string, unknown>,
): Promise<CalcResults> {
  if (!spec.calculations || spec.calculations.length === 0) return {}

  // Lazy-load HyperFormula
  const { HyperFormula } = await import('hyperformula')

  const key = specKey(spec)

  // Rebuild HF instance if spec changed
  if (!hfCache || hfCache.specKey !== key) {
    const cellMap = buildCellMap(spec)
    const totalRows = cellMap.size

    // Initialise with empty data
    const emptyData: CellValue[][] = Array.from({ length: totalRows }, () => [null])

    const hf = HyperFormula.buildFromArray(emptyData, {
      licenseKey: 'gpl-v3',
    })
    const sheetId = hf.getSheetId('Sheet1') ?? 0

    hfCache = { hf, sheetId, cellMap, specKey: key }
  }

  const { hf, sheetId, cellMap } = hfCache

  // Populate cell values from current form values
  const allFields = spec.pages.flatMap((p) => p.fields)
  for (const field of allFields) {
    const cellPairs = fieldValueToCells(field, values[field.id], cellMap)
    for (const [ref, val] of cellPairs) {
      // Parse A1 to row/col indices
      const row = parseInt(ref.slice(1), 10) - 1
      hf.setCellContents({ sheet: sheetId, row, col: 0 }, [[val]])
    }
  }

  // Evaluate each calculation formula
  const results: CalcResults = {}
  for (const calc of spec.calculations!) {
    try {
      const rewritten = rewriteFormula(calc.formula, cellMap)
      // Temporarily set the formula in a scratch area — use a fixed high row
      // that's outside the data range (totalRows + calcIndex).
      const calcRowIndex = cellMap.size + spec.calculations!.indexOf(calc)
      hf.setCellContents(
        { sheet: sheetId, row: calcRowIndex, col: 0 },
        [[`=${rewritten}`]],
      )
      const raw = hf.getCellValue({ sheet: sheetId, row: calcRowIndex, col: 0 })
      if (raw instanceof Error || (typeof raw === 'object' && raw !== null && 'type' in raw)) {
        results[calc.id] = null
      } else {
        results[calc.id] = (raw as number | string | null) ?? null
      }
    } catch {
      results[calc.id] = null
    }
  }

  return results
}

/**
 * Synchronous version that returns stale/empty results while the async
 * computation is in flight. Useful for React renders that cannot `await`.
 *
 * On first call for a spec it returns `{}`. After the first `computeCalculations`
 * resolves, subsequent sync calls return the last computed values (because the
 * HF instance is cached and can be read without re-evaluating).
 */
export function computeCalculationsSync(
  spec: FormSpec,
  values: Record<string, unknown>,
): CalcResults {
  if (!spec.calculations || spec.calculations.length === 0) return {}
  if (!hfCache || hfCache.specKey !== specKey(spec)) return {}

  // HF is already loaded — re-run synchronously using the cached instance.
  const { hf, sheetId, cellMap } = hfCache
  const allFields = spec.pages.flatMap((p) => p.fields)
  for (const field of allFields) {
    const cellPairs = fieldValueToCells(field, values[field.id], cellMap)
    for (const [ref, val] of cellPairs) {
      const row = parseInt(ref.slice(1), 10) - 1
      hf.setCellContents({ sheet: sheetId, row, col: 0 }, [[val]])
    }
  }

  const results: CalcResults = {}
  for (const calc of spec.calculations!) {
    try {
      const rewritten = rewriteFormula(calc.formula, cellMap)
      const calcRowIndex = cellMap.size + spec.calculations!.indexOf(calc)
      hf.setCellContents(
        { sheet: sheetId, row: calcRowIndex, col: 0 },
        [[`=${rewritten}`]],
      )
      const raw = hf.getCellValue({ sheet: sheetId, row: calcRowIndex, col: 0 })
      if (raw instanceof Error || (typeof raw === 'object' && raw !== null && 'type' in raw)) {
        results[calc.id] = null
      } else {
        results[calc.id] = (raw as number | string | null) ?? null
      }
    } catch {
      results[calc.id] = null
    }
  }
  return results
}

/** Invalidates the cached HF instance (e.g. on spec save in the builder). */
export function invalidateCalcCache(): void {
  hfCache = null
}
