import React from 'react'
import { Controller, type Control } from 'react-hook-form'
import { Select } from '@mantine/core'
import type { SelectField as SelectFieldType } from '../types.js'

interface Props {
  field: SelectFieldType
  control: Control
  disabled?: boolean
}

export function SelectField({ field, control, disabled }: Props) {
  const data = field.options.map((o) => ({ value: o.value, label: o.label }))

  return (
    <Controller
      name={field.id}
      control={control}
      render={({ field: rhf, fieldState }) => (
        <Select
          label={field.label}
          description={field.help_text}
          required={field.required}
          disabled={disabled}
          error={fieldState.error?.message}
          data={data}
          value={rhf.value ?? null}
          onChange={(val) => rhf.onChange(val)}
          onBlur={rhf.onBlur}
          ref={rhf.ref}
          name={rhf.name}
          searchable={field.allow_other}
          allowDeselect
        />
      )}
    />
  )
}
