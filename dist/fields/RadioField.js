import { jsx as _jsx } from "react/jsx-runtime";
import { Controller } from 'react-hook-form';
import { Radio, Stack, Input } from '@mantine/core';
export function RadioField({ field, control, disabled }) {
    return (_jsx(Controller, { name: field.id, control: control, render: ({ field: rhf, fieldState }) => (_jsx(Input.Wrapper, { label: field.label, description: field.help_text, required: field.required, error: fieldState.error?.message, children: _jsx(Stack, { gap: "xs", mt: "xs", children: field.options.map((opt) => (_jsx(Radio, { value: opt.value, label: opt.label, checked: rhf.value === opt.value, onChange: () => rhf.onChange(opt.value), onBlur: rhf.onBlur, disabled: disabled, name: rhf.name }, opt.value))) }) })) }));
}
