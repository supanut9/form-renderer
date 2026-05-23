import React from 'react'
import { Controller, type Control } from 'react-hook-form'
import { Checkbox, Stack, Input } from '@mantine/core'
import type { CheckboxField as CheckboxFieldType } from '../types.js'

interface Props {
  field: CheckboxFieldType
  control: Control
  disabled?: boolean
}

export function CheckboxField({ field, control, disabled }: Props) {
  // Multi-option checkbox
  if (field.options && field.options.length > 0) {
    return (
      <Controller
        name={field.id}
        control={control}
        render={({ field: rhf, fieldState }) => {
          const selected: string[] = Array.isArray(rhf.value) ? rhf.value : []
          const toggle = (value: string) => {
            const next = selected.includes(value)
              ? selected.filter((v) => v !== value)
              : [...selected, value]
            rhf.onChange(next)
          }
          return (
            <Input.Wrapper
              label={field.label}
              description={field.help_text}
              required={field.required}
              error={fieldState.error?.message}
            >
              <Stack gap="xs" mt="xs">
                {field.options!.map((opt) => (
                  <Checkbox
                    key={opt.value}
                    value={opt.value}
                    label={opt.label}
                    checked={selected.includes(opt.value)}
                    onChange={() => toggle(opt.value)}
                    onBlur={rhf.onBlur}
                    disabled={disabled}
                    name={rhf.name}
                  />
                ))}
              </Stack>
            </Input.Wrapper>
          )
        }}
      />
    )
  }

  // Single boolean checkbox
  return (
    <Controller
      name={field.id}
      control={control}
      render={({ field: rhf, fieldState }) => (
        <Checkbox
          label={field.label}
          description={field.help_text}
          required={field.required}
          disabled={disabled}
          checked={Boolean(rhf.value)}
          onChange={(e) => rhf.onChange(e.currentTarget.checked)}
          onBlur={rhf.onBlur}
          name={rhf.name}
          ref={rhf.ref}
          error={fieldState.error?.message}
        />
      )}
    />
  )
}
