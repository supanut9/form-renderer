import React from 'react'
import { Controller, type Control } from 'react-hook-form'
import { Radio, Stack, Input } from '@mantine/core'
import type { RadioField as RadioFieldType } from '../types.js'

interface Props {
  field: RadioFieldType
  control: Control
  disabled?: boolean
}

export function RadioField({ field, control, disabled }: Props) {
  return (
    <Controller
      name={field.id}
      control={control}
      render={({ field: rhf, fieldState }) => (
        <Input.Wrapper
          label={field.label}
          description={field.help_text}
          required={field.required}
          error={fieldState.error?.message}
        >
          <Stack gap="xs" mt="xs">
            {field.options.map((opt) => (
              <Radio
                key={opt.value}
                value={opt.value}
                label={opt.label}
                checked={rhf.value === opt.value}
                onChange={() => rhf.onChange(opt.value)}
                onBlur={rhf.onBlur}
                disabled={disabled}
                name={rhf.name}
              />
            ))}
          </Stack>
        </Input.Wrapper>
      )}
    />
  )
}
