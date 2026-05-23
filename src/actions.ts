/**
 * actions.ts — Page-jump / page-skip action runner.
 *
 * Evaluates `spec.actions` for a given `page_exit` trigger to determine
 * the next page and any pages that should be skipped.
 *
 * Pure function; no React dependency.
 * Re-uses evalJsonLogic from safeJsonLogic.ts.
 */

import type { FormSpec } from './types.js'
import { evalJsonLogic } from './safeJsonLogic.js'
import type { CalcResults } from './calc.js'
import type { ScoreResult } from './scoring.js'

// ── Public types ──────────────────────────────────────────────────────────────

export interface PageExitResult {
  /** The page id the form should navigate to next. */
  nextPageId: string
  /** Page ids that are considered skipped (removed from submission payload). */
  skipped: string[]
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function buildActionContext(
  values: Record<string, unknown>,
  calcResults: CalcResults,
  scoreResult: ScoreResult,
): Record<string, unknown> {
  return {
    ...values,
    ...calcResults,
    score: scoreResult.total,
    score_bucket: scoreResult.bucket?.label ?? null,
  }
}

/** Returns the id of the page that follows `fromPageId` in spec order, or null if it's the last page. */
function nextInOrder(spec: FormSpec, fromPageId: string): string | null {
  const idx = spec.pages.findIndex((p) => p.id === fromPageId)
  if (idx < 0 || idx >= spec.pages.length - 1) return null
  return spec.pages[idx + 1].id
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Evaluate all `page_exit` actions for `fromPageId` and return the next
 * page id plus any pages to mark as skipped.
 *
 * Evaluation order:
 * 1. Iterate `spec.actions` in declaration order.
 * 2. For each action matching `trigger === 'page_exit'` and `page_id === fromPageId`,
 *    evaluate the `if` condition.
 * 3. First matching action wins:
 *    - `jump_to_page`: navigate to the specified page; all pages between
 *      `fromPageId` (exclusive) and `targetPageId` (exclusive) are skipped.
 *    - `skip_pages`: advance to next-in-order but mark the listed pages as
 *      skipped (they will be filtered from the submission payload).
 * 4. If no action matches: default to next page in spec order, no skips.
 *
 * When `fromPageId` is the last page, `nextPageId` is returned as
 * `'__submit__'` to signal submission.
 */
export function evaluatePageExitActions(
  spec: FormSpec,
  fromPageId: string,
  values: Record<string, unknown>,
  calcResults: CalcResults,
  scoreResult: ScoreResult,
): PageExitResult {
  const defaultNext = nextInOrder(spec, fromPageId) ?? '__submit__'

  const actions = spec.actions ?? []
  const relevantActions = actions.filter(
    (a) => a.trigger === 'page_exit' && a.page_id === fromPageId,
  )

  if (relevantActions.length === 0) {
    return { nextPageId: defaultNext, skipped: [] }
  }

  const context = buildActionContext(values, calcResults, scoreResult)

  for (const action of relevantActions) {
    const matches = evalJsonLogic(action.if, context)
    if (!matches) continue

    if ('jump_to_page' in action.do) {
      const targetId = action.do.jump_to_page

      // Collect pages between fromPageId (exclusive) and targetId (exclusive)
      const fromIdx = spec.pages.findIndex((p) => p.id === fromPageId)
      const toIdx = spec.pages.findIndex((p) => p.id === targetId)

      const skipped: string[] = []
      if (fromIdx >= 0 && toIdx > fromIdx + 1) {
        for (let i = fromIdx + 1; i < toIdx; i++) {
          skipped.push(spec.pages[i].id)
        }
      }

      return { nextPageId: targetId, skipped }
    }

    if ('skip_pages' in action.do) {
      return {
        nextPageId: defaultNext,
        skipped: action.do.skip_pages,
      }
    }
  }

  // No condition matched — default fallthrough.
  return { nextPageId: defaultNext, skipped: [] }
}
