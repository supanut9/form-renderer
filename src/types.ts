// Type-only mirror of form-api's form-spec.types.ts.
// Do NOT import zod here — this file is type-only.

export type JsonLogicRule = unknown

export interface FormAccess {
  mode: 'public_anonymous' | 'private_oidc' | 'link_token'
  require_account: boolean
  anonymous_allowed: boolean
}

export interface FormTheme {
  primary_color: string
  logo_url?: string
  font?: string
  custom_css?: string
}

// ── Select option ─────────────────────────────────────────────────────────────
export interface SelectOption {
  value: string
  label: string
}

// ── Common base ───────────────────────────────────────────────────────────────
export interface FormFieldBase {
  id: string
  label: string
  required: boolean
  help_text?: string
  show_if?: JsonLogicRule | null
  /**
   * When the form's prefill.mode === 'last_submission', this field receives
   * the prior submission's value as a default. Set to `false` to opt out
   * (e.g. for "this week's reflection"-style fields that should always
   * start blank). Default: true.
   */
  prefill?: boolean
  /**
   * Phase-2-lite auth mapping. When set, the renderer fills this field from
   * the authenticated visitor's OIDC profile claims as a fallback default —
   * a prior submission for the same field still wins. Useful for "your email"
   * style fields that should auto-fill on first visit.
   */
  auth_field?: 'email' | 'name' | 'sub'
}

// ── Field variants (discriminated on `type`) ──────────────────────────────────

export interface TextField extends FormFieldBase {
  type: 'text'
  placeholder?: string
  validation?: {
    min_length?: number
    max_length?: number
    pattern?: string
    pattern_message?: string
  }
}

export interface TextareaField extends FormFieldBase {
  type: 'textarea'
  placeholder?: string
  rows?: number
  validation?: {
    min_length?: number
    max_length?: number
    pattern?: string
    pattern_message?: string
  }
}

export interface NumberField extends FormFieldBase {
  type: 'number'
  placeholder?: string
  validation?: {
    min?: number
    max?: number
    integer_only?: boolean
  }
}

export interface EmailField extends FormFieldBase {
  type: 'email'
  placeholder?: string
}

export interface PhoneField extends FormFieldBase {
  type: 'phone'
  placeholder?: string
  default_country_code?: string
}

export interface SelectField extends FormFieldBase {
  type: 'select'
  options: SelectOption[]
  allow_other?: boolean
}

export interface MultiselectField extends FormFieldBase {
  type: 'multiselect'
  options: SelectOption[]
  min_selections?: number
  max_selections?: number
}

export interface CheckboxField extends FormFieldBase {
  type: 'checkbox'
  options?: SelectOption[] // omit → single boolean
}

export interface RadioField extends FormFieldBase {
  type: 'radio'
  options: SelectOption[]
  allow_other?: boolean
}

export interface DateField extends FormFieldBase {
  type: 'date'
  min_date?: string
  max_date?: string
  include_time?: boolean
}

export interface FileField extends FormFieldBase {
  type: 'file'
  validation?: {
    max_size_bytes?: number
    allowed_mime_types?: string[]
    max_files?: number
  }
}

export interface MatrixField extends FormFieldBase {
  type: 'matrix'
  columns: { value: string; label: string }[]
  rows_from_field?: string
  rows?: { value: string; label: string }[]
  required_all?: boolean
}

export type FormField =
  | TextField
  | TextareaField
  | NumberField
  | EmailField
  | PhoneField
  | SelectField
  | MultiselectField
  | CheckboxField
  | RadioField
  | DateField
  | FileField
  | MatrixField

// ── Page ──────────────────────────────────────────────────────────────────────
export interface FormPage {
  id: string
  title: string
  fields: FormField[]
  show_if?: JsonLogicRule | null
}

// ── Thank-you page ────────────────────────────────────────────────────────────
export interface FormThankYou {
  title: string
  body_md?: string
  redirect_url_template?: string
}

// ── Submit config ─────────────────────────────────────────────────────────────
export interface FormSubmitConfig {
  webhooks?: { url: string; secret_ref: string }[]
  post_actions?: string[]
}

// ── Prefill config ────────────────────────────────────────────────────────────
export interface FormPrefillConfig {
  /**
   * `none` (default) — never prefill, every visit is blank.
   * `last_submission` — load the visitor's last submission's payload as
   * defaults. Per-field opt-out via `field.prefill: false`.
   */
  mode: 'none' | 'last_submission'
  /**
   * `authenticated` (default) — only match by accounts.id.
   * `both` — also match by anonymous_token cookie. Useful for true anonymous
   * flows; privacy trade-off (a shared browser shows the last visitor's
   * answers).
   */
  identity: 'authenticated' | 'both'
  /**
   * `append` (default) — every submit creates a new row; history preserved.
   * `replace` — soft-delete prior matching submissions before inserting.
   * Useful for "single-answer" forms (profile, preferences).
   */
  submit_behavior: 'append' | 'replace'
}

// ── Phase 3A — Calculations ───────────────────────────────────────────────────
export interface FormCalculation {
  id: string
  label: string
  formula: string
  hidden?: boolean
}

// ── Phase 3A — Scoring ────────────────────────────────────────────────────────
export interface ScoringRule {
  if: JsonLogicRule
  then: { add: number } | { set: number }
}

export interface ScoringBucket {
  min: number
  max: number
  label: string
}

export interface FormScoring {
  enabled: boolean
  rules: ScoringRule[]
  buckets?: ScoringBucket[]
}

// ── Phase 3A — Actions ────────────────────────────────────────────────────────
export type ActionDo =
  | { jump_to_page: string }
  | { skip_pages: string[] }

export interface FormAction {
  trigger: 'page_exit'
  page_id: string
  if: JsonLogicRule
  do: ActionDo
}

// ── Phase 3B — Payment ────────────────────────────────────────────────────────
export interface FormPayment {
  mode: 'fixed' | 'calculated' | 'tier'
  currency: string
  amount_minor?: number
  amount_formula?: string
  tiers?: unknown[]
  capture_intent: 'on_submit' | 'manual'
  stripe_account_id?: string
  required_for_submit: boolean
}

// ── FormSpec (root document) ──────────────────────────────────────────────────
export interface FormSpec {
  id: string
  version: number
  title: string
  type: 'main' | 'dynamic'
  access: FormAccess
  event_key?: string
  theme?: FormTheme
  pages: FormPage[]
  thank_you?: FormThankYou
  submit?: FormSubmitConfig
  prefill?: FormPrefillConfig
  // Phase 3A extensions (all optional — older specs remain valid)
  calculations?: FormCalculation[]
  scoring?: FormScoring
  actions?: FormAction[]
  // Phase 3B extension
  payment?: FormPayment
}

// ── Submission ────────────────────────────────────────────────────────────────
export type FormSubmissionPayload = Record<string, unknown>
