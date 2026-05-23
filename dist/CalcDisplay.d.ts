/**
 * CalcDisplay — renders the live value of a single calculation.
 *
 * Usage:
 *   <CalcDisplay calcId="calc_total" />
 *   <CalcDisplay calcId="calc_total" format={(v) => `$${v}`} />
 *
 * Must be rendered inside a <Form> (which provides FormLogicContext).
 * Returns null when the calc result is null or the calcId is unknown.
 */
import React from 'react';
export interface CalcDisplayProps {
    calcId: string;
    /** Optional formatter. Receives the raw number | string and returns a React node. */
    format?: (value: number | string) => React.ReactNode;
    /** Mantine Text component color override. */
    color?: string;
}
export declare function CalcDisplay({ calcId, format, color }: CalcDisplayProps): import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=CalcDisplay.d.ts.map