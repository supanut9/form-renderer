import React from 'react'
import { Controller, type Control } from 'react-hook-form'
import { NumberInput } from '@mantine/core'
import type { NumberField as NumberFieldType } from '../types.js'

interface Props {
  field: NumberFieldType
  control: Control
  disabled?: boolean
}

export function NumberField({ field, control, disabled }: Props) {
  return (
    <Controller
      name={field.id}
      control={control}
      render={({ field: rhf, fieldState }) => (
        <NumberInput
          label={field.label}
          description={field.help_text}
          placeholder={field.placeholder}
          required={field.required}
          disabled={disabled}
          error={fieldState.error?.message}
          min={field.validation?.min}
          max={field.validation?.max}
          allowDecimal={!field.validation?.integer_only}
          value={rhf.value ?? ''}
          onChange={(val) => rhf.onChange(val === '' ? undefined : val)}
          onBlur={rhf.onBlur}
          ref={rhf.ref}
          name={rhf.name}
        />
      )}
    />
  )
}
