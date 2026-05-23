import React from 'react'
import { Controller, type Control } from 'react-hook-form'
import { MultiSelect } from '@mantine/core'
import type { MultiselectField as MultiselectFieldType } from '../types.js'

interface Props {
  field: MultiselectFieldType
  control: Control
  disabled?: boolean
}

export function MultiselectField({ field, control, disabled }: Props) {
  const data = field.options.map((o) => ({ value: o.value, label: o.label }))

  return (
    <Controller
      name={field.id}
      control={control}
      render={({ field: rhf, fieldState }) => (
        <MultiSelect
          label={field.label}
          description={field.help_text}
          required={field.required}
          disabled={disabled}
          error={fieldState.error?.message}
          data={data}
          value={rhf.value ?? []}
          onChange={(val) => rhf.onChange(val)}
          onBlur={rhf.onBlur}
          ref={rhf.ref}
          name={rhf.name}
          maxValues={field.max_selections}
        />
      )}
    />
  )
}
