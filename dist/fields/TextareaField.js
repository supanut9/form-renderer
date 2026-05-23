import { jsx as _jsx } from "react/jsx-runtime";
import { Controller } from 'react-hook-form';
import { Textarea } from '@mantine/core';
export function TextareaField({ field, control, disabled }) {
    return (_jsx(Controller, { name: field.id, control: control, render: ({ field: rhf, fieldState }) => (_jsx(Textarea, { ...rhf, value: rhf.value ?? '', label: field.label, description: field.help_text, placeholder: field.placeholder, rows: field.rows ?? 4, required: field.required, disabled: disabled, error: fieldState.error?.message })) }));
}
