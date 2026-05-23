import { useMemo } from 'react';
import { evalJsonLogic } from './safeJsonLogic.js';
/**
 * Evaluates json-logic show_if rules for all pages and fields.
 * Memoized on formData identity + spec.version to avoid redundant passes.
 */
export function useLogic(spec, formData) {
    return useMemo(() => {
        const pageVisibility = new Map();
        const fieldVisibility = new Map();
        for (const page of spec.pages) {
            const pageVisible = page.show_if != null
                ? evalJsonLogic(page.show_if, formData)
                : true;
            pageVisibility.set(page.id, pageVisible);
            for (const field of page.fields) {
                const fieldVisible = field.show_if != null
                    ? evalJsonLogic(field.show_if, formData)
                    : true;
                fieldVisibility.set(field.id, fieldVisible);
            }
        }
        return {
            isPageVisible: (pageId) => pageVisibility.get(pageId) ?? true,
            isFieldVisible: (fieldId) => fieldVisibility.get(fieldId) ?? true,
        };
        // Stringify formData so the memo invalidates when values change.
        // spec.version catches spec edits in preview mode.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [spec.version, JSON.stringify(formData)]);
}
