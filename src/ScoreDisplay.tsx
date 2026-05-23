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

import React from 'react'
import { Group, Text } from '@mantine/core'
import { useFormLogic } from './FormLogicContext.js'
import type { ScoreResult } from './scoring.js'

export interface ScoreDisplayProps {
  /** Show the bucket label alongside the numeric score. Default: false. */
  showBucket?: boolean
  /** Fully custom renderer. Receives the full ScoreResult. */
  format?: (result: ScoreResult) => React.ReactNode
  /** Mantine Text color override. */
  color?: string
}

export function ScoreDisplay({ showBucket = false, format, color }: ScoreDisplayProps) {
  const { scoreResult } = useFormLogic()

  if (format) {
    return <>{format(scoreResult)}</>
  }

  return (
    <Group gap="xs" component="span">
      <Text component="span" c={color}>
        {scoreResult.total}
      </Text>
      {showBucket && scoreResult.bucket && (
        <Text component="span" c={color} fs="italic">
          {scoreResult.bucket.label}
        </Text>
      )}
    </Group>
  )
}
