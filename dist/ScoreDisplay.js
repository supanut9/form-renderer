import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Group, Text } from '@mantine/core';
import { useFormLogic } from './FormLogicContext.js';
export function ScoreDisplay({ showBucket = false, format, color }) {
    const { scoreResult } = useFormLogic();
    if (format) {
        return _jsx(_Fragment, { children: format(scoreResult) });
    }
    return (_jsxs(Group, { gap: "xs", component: "span", children: [_jsx(Text, { component: "span", c: color, children: scoreResult.total }), showBucket && scoreResult.bucket && (_jsx(Text, { component: "span", c: color, fs: "italic", children: scoreResult.bucket.label }))] }));
}
