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

import React from 'react'
import { Text } from '@mantine/core'
import { useFormLogic } from './FormLogicContext.js'

export interface CalcDisplayProps {
  calcId: string
  /** Optional formatter. Receives the raw number | string and returns a React node. */
  format?: (value: number | string) => React.ReactNode
  /** Mantine Text component color override. */
  color?: string
}

export function CalcDisplay({ calcId, format, color }: CalcDisplayProps) {
  const { calcResults } = useFormLogic()
  const raw = calcResults[calcId]

  if (raw == null) return null

  const display = format ? format(raw) : String(raw)

  return (
    <Text component="span" c={color}>
      {display}
    </Text>
  )
}
