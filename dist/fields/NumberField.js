import { jsx as _jsx } from "react/jsx-runtime";
import { Controller } from 'react-hook-form';
import { NumberInput } from '@mantine/core';
export function NumberField({ field, control, disabled }) {
    return (_jsx(Controller, { name: field.id, control: control, render: ({ field: rhf, fieldState }) => (_jsx(NumberInput, { label: field.label, description: field.help_text, placeholder: field.placeholder, required: field.required, disabled: disabled, error: fieldState.error?.message, min: field.validation?.min, max: field.validation?.max, allowDecimal: !field.validation?.integer_only, value: rhf.value ?? '', onChange: (val) => rhf.onChange(val === '' ? undefined : val), onBlur: rhf.onBlur, ref: rhf.ref, name: rhf.name })) }));
}
