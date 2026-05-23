/**
 * FormLogicContext.tsx — React context that carries live calc results and score
 * so child components like <CalcDisplay> and <ScoreDisplay> can read them
 * without prop drilling.
 */

import React, { createContext, useContext } from 'react'
import type { CalcResults } from './calc.js'
import type { ScoreResult } from './scoring.js'

export interface FormLogicState {
  calcResults: CalcResults
  scoreResult: ScoreResult
}

const defaultState: FormLogicState = {
  calcResults: {},
  scoreResult: { total: 0, bucket: null },
}

export const FormLogicContext = createContext<FormLogicState>(defaultState)

export function useFormLogic(): FormLogicState {
  return useContext(FormLogicContext)
}

export interface FormLogicProviderProps {
  value: FormLogicState
  children: React.ReactNode
}

export function FormLogicProvider({ value, children }: FormLogicProviderProps) {
  return (
    <FormLogicContext.Provider value={value}>
      {children}
    </FormLogicContext.Provider>
  )
}
