/**
 * actions.ts — Page-jump / page-skip action runner.
 *
 * Evaluates `spec.actions` for a given `page_exit` trigger to determine
 * the next page and any pages that should be skipped.
 *
 * Pure function; no React dependency.
 * Re-uses evalJsonLogic from safeJsonLogic.ts.
 */
import type { FormSpec } from './types.js';
import type { CalcResults } from './calc.js';
import type { ScoreResult } from './scoring.js';
export interface PageExitResult {
    /** The page id the form should navigate to next. */
    nextPageId: string;
    /** Page ids that are considered skipped (removed from submission payload). */
    skipped: string[];
}
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
export declare function evaluatePageExitActions(spec: FormSpec, fromPageId: string, values: Record<string, unknown>, calcResults: CalcResults, scoreResult: ScoreResult): PageExitResult;
//# sourceMappingURL=actions.d.ts.map