import { jsx as _jsx } from "react/jsx-runtime";
import { Controller } from 'react-hook-form';
import { FileInput } from '@mantine/core';
export function FileField({ field, control, disabled }) {
    return (_jsx(Controller, { name: field.id, control: control, render: ({ field: rhf, fieldState }) => (_jsx(FileInput, { label: field.label, description: field.help_text, required: field.required, disabled: disabled, error: fieldState.error?.message, accept: field.validation?.allowed_mime_types?.join(','), multiple: (field.validation?.max_files ?? 1) > 1, value: rhf.value ?? null, onChange: (val) => rhf.onChange(val), onBlur: rhf.onBlur, ref: rhf.ref, name: rhf.name })) }));
}
