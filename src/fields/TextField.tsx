import React from 'react'
import { Controller, type Control } from 'react-hook-form'
import { TextInput } from '@mantine/core'
import type { EmailField, PhoneField, TextField as TextFieldType } from '../types.js'

interface Props {
  field: TextFieldType | EmailField | PhoneField
  control: Control
  disabled?: boolean
}

export function TextField({ field, control, disabled }: Props) {
  const inputType =
    field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'
  const placeholder =
    'placeholder' in field ? field.placeholder : undefined

  return (
    <Controller
      name={field.id}
      control={control}
      render={({ field: rhf, fieldState }) => (
        <TextInput
          {...rhf}
          value={rhf.value ?? ''}
          label={field.label}
          description={field.help_text}
          placeholder={placeholder}
          type={inputType}
          required={field.required}
          disabled={disabled}
          error={fieldState.error?.message}
        />
      )}
    />
  )
}
