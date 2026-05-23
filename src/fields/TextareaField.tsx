import React from 'react'
import { Controller, type Control } from 'react-hook-form'
import { Textarea } from '@mantine/core'
import type { TextareaField as TextareaFieldType } from '../types.js'

interface Props {
  field: TextareaFieldType
  control: Control
  disabled?: boolean
}

export function TextareaField({ field, control, disabled }: Props) {
  return (
    <Controller
      name={field.id}
      control={control}
      render={({ field: rhf, fieldState }) => (
        <Textarea
          {...rhf}
          value={rhf.value ?? ''}
          label={field.label}
          description={field.help_text}
          placeholder={field.placeholder}
          rows={field.rows ?? 4}
          required={field.required}
          disabled={disabled}
          error={fieldState.error?.message}
        />
      )}
    />
  )
}
