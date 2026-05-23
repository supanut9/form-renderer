import { jsx as _jsx } from "react/jsx-runtime";
import { Controller } from 'react-hook-form';
import { Checkbox, Stack, Input } from '@mantine/core';
export function CheckboxField({ field, control, disabled }) {
    // Multi-option checkbox
    if (field.options && field.options.length > 0) {
        return (_jsx(Controller, { name: field.id, control: control, render: ({ field: rhf, fieldState }) => {
                const selected = Array.isArray(rhf.value) ? rhf.value : [];
                const toggle = (value) => {
                    const next = selected.includes(value)
                        ? selected.filter((v) => v !== value)
                        : [...selected, value];
                    rhf.onChange(next);
                };
                return (_jsx(Input.Wrapper, { label: field.label, description: field.help_text, required: field.required, error: fieldState.error?.message, children: _jsx(Stack, { gap: "xs", mt: "xs", children: field.options.map((opt) => (_jsx(Checkbox, { value: opt.value, label: opt.label, checked: selected.includes(opt.value), onChange: () => toggle(opt.value), onBlur: rhf.onBlur, disabled: disabled, name: rhf.name }, opt.value))) }) }));
            } }));
    }
    // Single boolean checkbox
    return (_jsx(Controller, { name: field.id, control: control, render: ({ field: rhf, fieldState }) => (_jsx(Checkbox, { label: field.label, description: field.help_text, required: field.required, disabled: disabled, checked: Boolean(rhf.value), onChange: (e) => rhf.onChange(e.currentTarget.checked), onBlur: rhf.onBlur, name: rhf.name, ref: rhf.ref, error: fieldState.error?.message })) }));
}
