import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { Table, Input, Text } from '@mantine/core';
export function MatrixField({ field, control, disabled }) {
    // Watch the source field if rows are derived dynamically
    const sourceFieldValue = useWatch({
        control,
        name: field.rows_from_field ?? '__none__',
        disabled: !field.rows_from_field,
    });
    const rows = React.useMemo(() => {
        if (field.rows_from_field) {
            // Expect an array of string values from a multiselect field
            if (Array.isArray(sourceFieldValue) && sourceFieldValue.length > 0) {
                return sourceFieldValue.map((v) => ({ value: v, label: v }));
            }
            return [];
        }
        return field.rows ?? [];
    }, [field.rows_from_field, field.rows, sourceFieldValue]);
    const colData = field.columns.map((c) => ({ value: c.value, label: c.label }));
    return (_jsx(Controller, { name: field.id, control: control, render: ({ field: rhf, fieldState }) => {
            const current = rhf.value && typeof rhf.value === 'object' ? rhf.value : {};
            const handleChange = (rowValue, colValue) => {
                const next = { ...current };
                if (colValue == null) {
                    delete next[rowValue];
                }
                else {
                    next[rowValue] = colValue;
                }
                rhf.onChange(next);
            };
            return (_jsx(Input.Wrapper, { label: field.label, description: field.help_text, required: field.required, error: fieldState.error?.message, children: rows.length === 0 ? (_jsx(Text, { size: "sm", c: "dimmed", mt: "xs", children: "No rows available." })) : (_jsxs(Table, { mt: "xs", withTableBorder: true, withColumnBorders: true, children: [_jsx(Table.Thead, { children: _jsxs(Table.Tr, { children: [_jsx(Table.Th, {}), field.columns.map((col) => (_jsx(Table.Th, { children: col.label }, col.value)))] }) }), _jsx(Table.Tbody, { children: rows.map((row) => (_jsxs(Table.Tr, { children: [_jsx(Table.Td, { children: row.label }), field.columns.map((col) => (_jsx(Table.Td, { children: _jsx("input", { type: "radio", name: `${rhf.name}.${row.value}`, value: col.value, checked: current[row.value] === col.value, onChange: () => handleChange(row.value, col.value), onBlur: rhf.onBlur, disabled: disabled, "aria-label": `${row.label} — ${col.label}` }) }, col.value)))] }, row.value))) })] })) }));
        } }));
}
