import { useMemo } from 'react'
import type { FormSpec } from './types.js'
import { evalJsonLogic } from './safeJsonLogic.js'

export interface LogicHelpers {
  isPageVisible: (pageId: string) => boolean
  isFieldVisible: (fieldId: string) => boolean
}

/**
 * Evaluates json-logic show_if rules for all pages and fields.
 * Memoized on formData identity + spec.version to avoid redundant passes.
 */
export function useLogic(
  spec: FormSpec,
  formData: Record<string, unknown>,
): LogicHelpers {
  return useMemo(() => {
    const pageVisibility = new Map<string, boolean>()
    const fieldVisibility = new Map<string, boolean>()

    for (const page of spec.pages) {
      const pageVisible =
        page.show_if != null
          ? evalJsonLogic(page.show_if, formData)
          : true
      pageVisibility.set(page.id, pageVisible)

      for (const field of page.fields) {
        const fieldVisible =
          field.show_if != null
            ? evalJsonLogic(field.show_if, formData)
            : true
        fieldVisibility.set(field.id, fieldVisible)
      }
    }

    return {
      isPageVisible: (pageId: string) => pageVisibility.get(pageId) ?? true,
      isFieldVisible: (fieldId: string) => fieldVisibility.get(fieldId) ?? true,
    }
    // Stringify formData so the memo invalidates when values change.
    // spec.version catches spec edits in preview mode.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec.version, JSON.stringify(formData)])
}
