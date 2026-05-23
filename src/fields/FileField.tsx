import React from 'react'
import { Controller, type Control } from 'react-hook-form'
import { FileInput } from '@mantine/core'
import type { FileField as FileFieldType } from '../types.js'

interface Props {
  field: FileFieldType
  control: Control
  disabled?: boolean
}

export function FileField({ field, control, disabled }: Props) {
  return (
    <Controller
      name={field.id}
      control={control}
      render={({ field: rhf, fieldState }) => (
        <FileInput
          label={field.label}
          description={field.help_text}
          required={field.required}
          disabled={disabled}
          error={fieldState.error?.message}
          accept={field.validation?.allowed_mime_types?.join(',')}
          multiple={(field.validation?.max_files ?? 1) > 1}
          value={rhf.value ?? null}
          onChange={(val) => rhf.onChange(val)}
          onBlur={rhf.onBlur}
          ref={rhf.ref}
          name={rhf.name}
          // TODO(Wave4/L10): replace with presigned-upload flow
        />
      )}
    />
  )
}
