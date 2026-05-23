/**
 * scoring.ts — Scoring rule evaluator.
 *
 * Re-uses the evalJsonLogic engine from safeJsonLogic.ts (which wraps
 * json-logic-js). Does NOT import json-logic-js directly, per the spec.
 *
 * Calc results are merged into the data context as top-level keys so
 * rules can reference `{ "var": "calc_total" }` directly.
 *
 * Pure function; no React dependency.
 */
import type { FormSpec, ScoringBucket } from './types.js';
import type { CalcResults } from './calc.js';
export interface ScoreResult {
    total: number;
    bucket: ScoringBucket | null;
}
/**
 * Evaluate the `spec.scoring` rules against the current form values and
 * calc results.
 *
 * - `total` starts at 0.
 * - Rules are applied in declaration order.
 *   - `{ add: n }` increments the running total.
 *   - `{ set: n }` replaces the running total.
 * - `calcResults` are merged into the data context as flat keys, so rules
 *   can reference `{ "var": "calc_total" }`.
 * - A synthetic `"score"` key is injected into the data context after each
 *   rule so subsequent rules can branch on the running total.
 */
export declare function computeScore(spec: FormSpec, values: Record<string, unknown>, calcResults: CalcResults): ScoreResult;
//# sourceMappingURL=scoring.d.ts.map