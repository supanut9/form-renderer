// Public API of form-renderer

export { Form } from './Form.js'
export type { FormProps } from './Form.js'

export { useLogic } from './useLogic.js'
export type { LogicHelpers } from './useLogic.js'

export { useTheme } from './useTheme.js'
export type { ThemeResult } from './useTheme.js'

export { buildZodSchema } from './buildZodSchema.js'

export { evalJsonLogic } from './safeJsonLogic.js'

export { FieldRenderer } from './fields/FieldRenderer.js'

// Phase 3A — Calculations
export { computeCalculations, computeCalculationsSync, invalidateCalcCache } from './calc.js'
export type { CalcResults } from './calc.js'

// Phase 3A — Scoring
export { computeScore } from './scoring.js'
export type { ScoreResult } from './scoring.js'

// Phase 3A — Actions
export { evaluatePageExitActions } from './actions.js'
export type { PageExitResult } from './actions.js'

// Phase 3A — Context + display components
export { FormLogicProvider, FormLogicContext, useFormLogic } from './FormLogicContext.js'
export type { FormLogicState, FormLogicProviderProps } from './FormLogicContext.js'
export { CalcDisplay } from './CalcDisplay.js'
export type { CalcDisplayProps } from './CalcDisplay.js'
export { ScoreDisplay } from './ScoreDisplay.js'
export type { ScoreDisplayProps } from './ScoreDisplay.js'

export type {
  FormSpec,
  FormPage,
  FormField,
  FormFieldBase,
  FormAccess,
  FormTheme,
  FormThankYou,
  FormSubmitConfig,
  FormSubmissionPayload,
  JsonLogicRule,
  SelectOption,
  TextField,
  TextareaField,
  NumberField,
  EmailField,
  PhoneField,
  SelectField,
  MultiselectField,
  CheckboxField,
  RadioField,
  DateField,
  FileField,
  MatrixField,
  // Phase 3A type extensions
  FormCalculation,
  FormScoring,
  ScoringRule,
  ScoringBucket,
  FormAction,
  ActionDo,
} from './types.js'
