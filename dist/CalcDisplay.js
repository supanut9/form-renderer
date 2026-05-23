import { jsx as _jsx } from "react/jsx-runtime";
import { Text } from '@mantine/core';
import { useFormLogic } from './FormLogicContext.js';
export function CalcDisplay({ calcId, format, color }) {
    const { calcResults } = useFormLogic();
    const raw = calcResults[calcId];
    if (raw == null)
        return null;
    const display = format ? format(raw) : String(raw);
    return (_jsx(Text, { component: "span", c: color, children: display }));
}
