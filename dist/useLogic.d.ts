import type { FormSpec } from './types.js';
export interface LogicHelpers {
    isPageVisible: (pageId: string) => boolean;
    isFieldVisible: (fieldId: string) => boolean;
}
/**
 * Evaluates json-logic show_if rules for all pages and fields.
 * Memoized on formData identity + spec.version to avoid redundant passes.
 */
export declare function useLogic(spec: FormSpec, formData: Record<string, unknown>): LogicHelpers;
//# sourceMappingURL=useLogic.d.ts.map