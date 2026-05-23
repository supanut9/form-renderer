import { z } from 'zod'
import type { FormSpec, FormField } from './types.js'

const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/

function buildFieldSchema(field: FormField): z.ZodTypeAny {
  switch (field.type) {
    case 'text': {
      let s = z.string()
      if (field.validation?.min_length != null)
        s = s.min(field.validation.min_length)
      if (field.validation?.max_length != null)
        s = s.max(field.validation.max_length)
      if (field.validation?.pattern) {
        const msg = field.validation.pattern_message ?? 'Invalid format'
        s = s.regex(new RegExp(field.validation.pattern), msg)
      }
      return field.required ? s.min(1, 'Required') : s.optional()
    }

    case 'textarea': {
      let s = z.string()
      if (field.validation?.min_length != null)
        s = s.min(field.validation.min_length)
      if (field.validation?.max_length != null)
        s = s.max(field.validation.max_length)
      return field.required ? s.min(1, 'Required') : s.optional()
    }

    case 'number': {
      let s = z.number()
      if (field.validation?.min != null) s = s.min(field.validation.min)
      if (field.validation?.max != null) s = s.max(field.validation.max)
      if (field.validation?.integer_only) s = s.int()
      const coerced = z.preprocess(
        (v) => (v === '' || v == null ? undefined : Number(v)),
        field.required ? s : s.optional(),
      )
      return coerced
    }

    case 'email': {
      const s = z.string().email('Invalid email address')
      return field.required ? s.min(1, 'Required') : s.optional()
    }

    case 'phone': {
      const s = z.string().regex(PHONE_REGEX, 'Invalid phone number')
      return field.required ? s.min(1, 'Required') : s.optional()
    }

    case 'select': {
      const validValues = field.options.map((o) => o.value)
      const s = field.allow_other
        ? z.string()
        : z.string().refine((v) => validValues.includes(v), 'Invalid option')
      return field.required ? s.min(1, 'Required') : s.optional()
    }

    case 'multiselect': {
      const validValues = field.options.map((o) => o.value)
      let s = z.array(
        z.string().refine((v) => validValues.includes(v), 'Invalid option'),
      )
      if (field.min_selections != null)
        s = s.min(field.min_selections, `Select at least ${field.min_selections}`)
      if (field.max_selections != null)
        s = s.max(field.max_selections, `Select at most ${field.max_selections}`)
      return field.required ? s.min(1, 'Required') : s.optional()
    }

    case 'checkbox': {
      if (field.options && field.options.length > 0) {
        const validValues = field.options.map((o) => o.value)
        let s = z.array(
          z.string().refine((v) => validValues.includes(v), 'Invalid option'),
        )
        if (field.required) s = s.min(1, 'Required')
        return field.required ? s : s.optional()
      }
      // Single boolean checkbox
      return field.required
        ? z.literal(true, { error: 'Required' })
        : z.boolean().optional()
    }

    case 'radio': {
      const validValues = field.options.map((o) => o.value)
      const s = field.allow_other
        ? z.string()
        : z.string().refine((v) => validValues.includes(v), 'Invalid option')
      return field.required ? s.min(1, 'Required') : s.optional()
    }

    case 'date': {
      // Values arrive as ISO strings — date-only ("2026-05-17") when
      // include_time is false, otherwise a full ISO timestamp. We accept
      // both shapes and enforce min/max by simple string comparison since
      // ISO 8601 is lexicographically sortable.
      const minDate = field.min_date
      const maxDate = field.max_date
      const isoCheck = z
        .string()
        .refine(
          (v) => /^\d{4}-\d{2}-\d{2}(T.*)?$/.test(v),
          'Must be an ISO date (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)',
        )
        .refine(
          (v) => !minDate || v >= minDate,
          minDate ? `Must be on or after ${minDate}` : '',
        )
        .refine(
          (v) => !maxDate || v <= maxDate,
          maxDate ? `Must be on or before ${maxDate}` : '',
        )
      return field.required ? isoCheck : isoCheck.optional()
    }

    case 'file': {
      // File validation (size checked at runtime by FileField component)
      // z.instanceof(File) cannot validate in SSR; use z.any() and validate in the component.
      return field.required ? z.any().refine((v) => v != null, 'Required') : z.any().optional()
    }

    case 'matrix': {
      // Value shape: Record<rowValue, columnValue>
      const s = z.record(z.string(), z.string())
      if (field.required && field.required_all) {
        // Further validation is done at submit time in Form.tsx
        return s
      }
      return field.required ? s : s.optional()
    }
  }
}

export interface BuildZodSchemaOptions {
  /**
   * When provided, only these field ids are validated as authoritative.
   * Fields outside the set become `.optional()` so hidden / future-page
   * required fields do not block submission.
   */
  scope?: Set<string>
}

export function buildZodSchema(
  spec: FormSpec,
  opts: BuildZodSchemaOptions = {},
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {}
  for (const page of spec.pages) {
    for (const field of page.fields) {
      if (opts.scope && !opts.scope.has(field.id)) {
        shape[field.id] = z.any().optional()
      } else {
        shape[field.id] = buildFieldSchema(field)
      }
    }
  }
  return z.object(shape)
}
