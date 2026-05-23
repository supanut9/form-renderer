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
import type { FormSpec } from './types.js';
export type CalcResults = Record<string, number | string | null>;
/**
 * Compute all `spec.calculations` against the current `values`.
 *
 * Returns a map of `{ [calcId]: result }`.
 * Returns `{}` synchronously (before HF loads) or when spec has no calculations.
 *
 * The returned promise resolves to the same map after the first lazy load;
 * subsequent calls with the same spec key reuse the cached HF instance.
 */
export declare function computeCalculations(spec: FormSpec, values: Record<string, unknown>): Promise<CalcResults>;
/**
 * Synchronous version that returns stale/empty results while the async
 * computation is in flight. Useful for React renders that cannot `await`.
 *
 * On first call for a spec it returns `{}`. After the first `computeCalculations`
 * resolves, subsequent sync calls return the last computed values (because the
 * HF instance is cached and can be read without re-evaluating).
 */
export declare function computeCalculationsSync(spec: FormSpec, values: Record<string, unknown>): CalcResults;
/** Invalidates the cached HF instance (e.g. on spec save in the builder). */
export declare function invalidateCalcCache(): void;
//# sourceMappingURL=calc.d.ts.map