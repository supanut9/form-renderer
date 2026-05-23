import React from 'react'
import { Controller, type Control, useWatch } from 'react-hook-form'
import { Table, Select, Input, Text } from '@mantine/core'
import type { MatrixField as MatrixFieldType } from '../types.js'

interface Props {
  field: MatrixFieldType
  control: Control
  disabled?: boolean
}

export function MatrixField({ field, control, disabled }: Props) {
  // Watch the source field if rows are derived dynamically
  const sourceFieldValue = useWatch({
    control,
    name: field.rows_from_field ?? '__none__',
    disabled: !field.rows_from_field,
  })

  const rows: { value: string; label: string }[] = React.useMemo(() => {
    if (field.rows_from_field) {
      // Expect an array of string values from a multiselect field
      if (Array.isArray(sourceFieldValue) && sourceFieldValue.length > 0) {
        return (sourceFieldValue as string[]).map((v) => ({ value: v, label: v }))
      }
      return []
    }
    return field.rows ?? []
  }, [field.rows_from_field, field.rows, sourceFieldValue])

  const colData = field.columns.map((c) => ({ value: c.value, label: c.label }))

  return (
    <Controller
      name={field.id}
      control={control}
      render={({ field: rhf, fieldState }) => {
        const current: Record<string, string> =
          rhf.value && typeof rhf.value === 'object' ? rhf.value : {}

        const handleChange = (rowValue: string, colValue: string | null) => {
          const next = { ...current }
          if (colValue == null) {
            delete next[rowValue]
          } else {
            next[rowValue] = colValue
          }
          rhf.onChange(next)
        }

        return (
          <Input.Wrapper
            label={field.label}
            description={field.help_text}
            required={field.required}
            error={fieldState.error?.message}
          >
            {rows.length === 0 ? (
              <Text size="sm" c="dimmed" mt="xs">
                No rows available.
              </Text>
            ) : (
              <Table mt="xs" withTableBorder withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th />
                    {field.columns.map((col) => (
                      <Table.Th key={col.value}>{col.label}</Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {rows.map((row) => (
                    <Table.Tr key={row.value}>
                      <Table.Td>{row.label}</Table.Td>
                      {field.columns.map((col) => (
                        <Table.Td key={col.value}>
                          <input
                            type="radio"
                            name={`${rhf.name}.${row.value}`}
                            value={col.value}
                            checked={current[row.value] === col.value}
                            onChange={() => handleChange(row.value, col.value)}
                            onBlur={rhf.onBlur}
                            disabled={disabled}
                            aria-label={`${row.label} — ${col.label}`}
                          />
                        </Table.Td>
                      ))}
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Input.Wrapper>
        )
      }}
    />
  )
}
