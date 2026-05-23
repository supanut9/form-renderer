import React from 'react'
import type { Control } from 'react-hook-form'
import type { FormField } from '../types.js'
import { TextField } from './TextField.js'
import { TextareaField } from './TextareaField.js'
import { NumberField } from './NumberField.js'
import { SelectField } from './SelectField.js'
import { MultiselectField } from './MultiselectField.js'
import { RadioField } from './RadioField.js'
import { CheckboxField } from './CheckboxField.js'
import { DateField } from './DateField.js'
import { FileField } from './FileField.js'
import { MatrixField } from './MatrixField.js'

interface Props {
  field: FormField
  control: Control
  disabled?: boolean
}

export function FieldRenderer({ field, control, disabled }: Props) {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'phone':
      return <TextField field={field} control={control} disabled={disabled} />
    case 'textarea':
      return <TextareaField field={field} control={control} disabled={disabled} />
    case 'number':
      return <NumberField field={field} control={control} disabled={disabled} />
    case 'select':
      return <SelectField field={field} control={control} disabled={disabled} />
    case 'multiselect':
      return <MultiselectField field={field} control={control} disabled={disabled} />
    case 'radio':
      return <RadioField field={field} control={control} disabled={disabled} />
    case 'checkbox':
      return <CheckboxField field={field} control={control} disabled={disabled} />
    case 'date':
      return <DateField field={field} control={control} disabled={disabled} />
    case 'file':
      return <FileField field={field} control={control} disabled={disabled} />
    case 'matrix':
      return <MatrixField field={field} control={control} disabled={disabled} />
  }
}
