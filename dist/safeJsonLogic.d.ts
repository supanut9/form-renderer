/**
 * Wraps json-logic-js apply() with a try/catch.
 * Returns false (fail-closed) on any evaluation error.
 * Works in both browser and Node 22 (json-logic-js 2.0.5 is isomorphic).
 */
export declare function evalJsonLogic(rule: unknown, data: Record<string, unknown>): boolean;
//# sourceMappingURL=safeJsonLogic.d.ts.map