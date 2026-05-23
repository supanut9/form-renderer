import { jsx as _jsx } from "react/jsx-runtime";
import { Controller } from 'react-hook-form';
import { TextInput } from '@mantine/core';
export function TextField({ field, control, disabled }) {
    const inputType = field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text';
    const placeholder = 'placeholder' in field ? field.placeholder : undefined;
    return (_jsx(Controller, { name: field.id, control: control, render: ({ field: rhf, fieldState }) => (_jsx(TextInput, { ...rhf, value: rhf.value ?? '', label: field.label, description: field.help_text, placeholder: placeholder, type: inputType, required: field.required, disabled: disabled, error: fieldState.error?.message })) }));
}
