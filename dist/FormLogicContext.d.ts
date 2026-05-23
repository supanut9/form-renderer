/**
 * FormLogicContext.tsx — React context that carries live calc results and score
 * so child components like <CalcDisplay> and <ScoreDisplay> can read them
 * without prop drilling.
 */
import React from 'react';
import type { CalcResults } from './calc.js';
import type { ScoreResult } from './scoring.js';
export interface FormLogicState {
    calcResults: CalcResults;
    scoreResult: ScoreResult;
}
export declare const FormLogicContext: React.Context<FormLogicState>;
export declare function useFormLogic(): FormLogicState;
export interface FormLogicProviderProps {
    value: FormLogicState;
    children: React.ReactNode;
}
export declare function FormLogicProvider({ value, children }: FormLogicProviderProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=FormLogicContext.d.ts.map