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
import { evalJsonLogic } from './safeJsonLogic.js';
// ── Helpers ───────────────────────────────────────────────────────────────────
function findBucket(buckets, score) {
    if (!buckets || buckets.length === 0)
        return null;
    return buckets.find((b) => score >= b.min && score <= b.max) ?? null;
}
// ── Public API ────────────────────────────────────────────────────────────────
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
export function computeScore(spec, values, calcResults) {
    if (!spec.scoring?.enabled) {
        return { total: 0, bucket: null };
    }
    const { rules, buckets } = spec.scoring;
    // Merge values + calc results into a flat data context.
    const data = {
        ...values,
        ...calcResults,
        score: 0, // start with 0 so first rule can see it
    };
    let total = 0;
    for (const rule of rules) {
        const match = evalJsonLogic(rule.if, data);
        if (match) {
            if ('add' in rule.then) {
                total += rule.then.add;
            }
            else if ('set' in rule.then) {
                total = rule.then.set;
            }
            // Update the running score in the context for subsequent rules.
            data['score'] = total;
        }
    }
    return {
        total,
        bucket: findBucket(buckets, total),
    };
}
