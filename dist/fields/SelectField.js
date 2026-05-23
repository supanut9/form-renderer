import { jsx as _jsx } from "react/jsx-runtime";
import { Controller } from 'react-hook-form';
import { Select } from '@mantine/core';
export function SelectField({ field, control, disabled }) {
    const data = field.options.map((o) => ({ value: o.value, label: o.label }));
    return (_jsx(Controller, { name: field.id, control: control, render: ({ field: rhf, fieldState }) => (_jsx(Select, { label: field.label, description: field.help_text, required: field.required, disabled: disabled, error: fieldState.error?.message, data: data, value: rhf.value ?? null, onChange: (val) => rhf.onChange(val), onBlur: rhf.onBlur, ref: rhf.ref, name: rhf.name, searchable: field.allow_other, allowDeselect: true })) }));
}
