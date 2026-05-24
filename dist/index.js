// Public API of form-renderer
export { Form } from './Form.js';
export { useLogic } from './useLogic.js';
export { useTheme } from './useTheme.js';
export { buildZodSchema } from './buildZodSchema.js';
export { evalJsonLogic } from './safeJsonLogic.js';
export { FieldRenderer } from './fields/FieldRenderer.js';
// Phase 3A — Calculations
export { computeCalculations, computeCalculationsSync, invalidateCalcCache } from './calc.js';
// Phase 3A — Scoring
export { computeScore } from './scoring.js';
// Phase 3A — Actions
export { evaluatePageExitActions } from './actions.js';
// Phase 3A — Context + display components
export { FormLogicProvider, FormLogicContext, useFormLogic } from './FormLogicContext.js';
export { CalcDisplay } from './CalcDisplay.js';
export { ScoreDisplay } from './ScoreDisplay.js';
// Phase 3B — Payment block (context-injection pattern; Stripe-free)
export { PaymentField, PaymentBlockHostInjectionContext } from './paymentField.js';
