import { jsx as _jsx } from "react/jsx-runtime";
import { Controller } from 'react-hook-form';
import { DatePickerInput, DateTimePicker } from '@mantine/dates';
function parseDate(s) {
    if (!s)
        return undefined;
    const d = new Date(s);
    return isNaN(d.getTime()) ? undefined : d;
}
export function DateField({ field, control, disabled }) {
    const minDate = parseDate(field.min_date);
    const maxDate = parseDate(field.max_date);
    return (_jsx(Controller, { name: field.id, control: control, render: ({ field: rhf, fieldState }) => {
            const dateValue = rhf.value ? new Date(rhf.value) : null;
            if (field.include_time) {
                return (_jsx(DateTimePicker, { label: field.label, description: field.help_text, required: field.required, disabled: disabled, error: fieldState.error?.message, minDate: minDate, maxDate: maxDate, value: isNaN(dateValue?.getTime() ?? NaN) ? null : dateValue, onChange: (val) => rhf.onChange(val ?? ''), onBlur: rhf.onBlur, ref: rhf.ref, name: rhf.name }));
            }
            return (_jsx(DatePickerInput, { label: field.label, description: field.help_text, required: field.required, disabled: disabled, error: fieldState.error?.message, minDate: minDate, maxDate: maxDate, value: isNaN(dateValue?.getTime() ?? NaN) ? null : dateValue, onChange: (val) => rhf.onChange(val ?? ''), onBlur: rhf.onBlur, ref: rhf.ref, name: rhf.name }));
        } }));
}
