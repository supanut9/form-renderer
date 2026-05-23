/**
 * ScoreDisplay — renders the current total score and optional bucket label.
 *
 * Usage:
 *   <ScoreDisplay />
 *   <ScoreDisplay showBucket />
 *   <ScoreDisplay format={({ total, bucket }) => `${total} pts (${bucket?.label})`} />
 *
 * Must be rendered inside a <Form> (which provides FormLogicContext).
 * Returns null when scoring is not active (score === 0 and no bucket).
 */
import React from 'react';
import type { ScoreResult } from './scoring.js';
export interface ScoreDisplayProps {
    /** Show the bucket label alongside the numeric score. Default: false. */
    showBucket?: boolean;
    /** Fully custom renderer. Receives the full ScoreResult. */
    format?: (result: ScoreResult) => React.ReactNode;
    /** Mantine Text color override. */
    color?: string;
}
export declare function ScoreDisplay({ showBucket, format, color }: ScoreDisplayProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=ScoreDisplay.d.ts.map