import jsonLogic from 'json-logic-js'

/**
 * Wraps json-logic-js apply() with a try/catch.
 * Returns false (fail-closed) on any evaluation error.
 * Works in both browser and Node 22 (json-logic-js 2.0.5 is isomorphic).
 */
export function evalJsonLogic(rule: unknown, data: Record<string, unknown>): boolean {
  if (rule === null || rule === undefined) return true
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Boolean(jsonLogic.apply(rule as any, data))
  } catch (err) {
    console.error('[form-renderer] json-logic evaluation error', err, { rule, data })
    return false
  }
}
