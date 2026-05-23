import { jsx as _jsx } from "react/jsx-runtime";
/**
 * FormLogicContext.tsx — React context that carries live calc results and score
 * so child components like <CalcDisplay> and <ScoreDisplay> can read them
 * without prop drilling.
 */
import { createContext, useContext } from 'react';
const defaultState = {
    calcResults: {},
    scoreResult: { total: 0, bucket: null },
};
export const FormLogicContext = createContext(defaultState);
export function useFormLogic() {
    return useContext(FormLogicContext);
}
export function FormLogicProvider({ value, children }) {
    return (_jsx(FormLogicContext.Provider, { value: value, children: children }));
}
