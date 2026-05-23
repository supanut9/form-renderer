import React from 'react'
import { Controller, type Control } from 'react-hook-form'
import { DatePickerInput, DateTimePicker } from '@mantine/dates'
import type { DateField as DateFieldType } from '../types.js'

interface Props {
  field: DateFieldType
  control: Control
  disabled?: boolean
}

function parseDate(s: string | undefined): Date | undefined {
  if (!s) return undefined
  const d = new Date(s)
  return isNaN(d.getTime()) ? undefined : d
}

export function DateField({ field, control, disabled }: Props) {
  const minDate = parseDate(field.min_date)
  const maxDate = parseDate(field.max_date)

  return (
    <Controller
      name={field.id}
      control={control}
      render={({ field: rhf, fieldState }) => {
        const dateValue = rhf.value ? new Date(rhf.value as string) : null

        if (field.include_time) {
          return (
            <DateTimePicker
              label={field.label}
              description={field.help_text}
              required={field.required}
              disabled={disabled}
              error={fieldState.error?.message}
              minDate={minDate}
              maxDate={maxDate}
              value={isNaN(dateValue?.getTime() ?? NaN) ? null : dateValue}
              onChange={(val) => rhf.onChange(val ?? '')}
              onBlur={rhf.onBlur}
              ref={rhf.ref}
              name={rhf.name}
            />
          )
        }

        return (
          <DatePickerInput
            label={field.label}
            description={field.help_text}
            required={field.required}
            disabled={disabled}
            error={fieldState.error?.message}
            minDate={minDate}
            maxDate={maxDate}
            value={isNaN(dateValue?.getTime() ?? NaN) ? null : dateValue}
            onChange={(val) => rhf.onChange(val ?? '')}
            onBlur={rhf.onBlur}
            ref={rhf.ref}
            name={rhf.name}
          />
        )
      }}
    />
  )
}
