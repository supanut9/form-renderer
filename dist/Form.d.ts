import type { FormSpec, FormSubmissionPayload } from './types.js';
export interface FormProps {
    spec: FormSpec;
    defaultValues?: Partial<FormSubmissionPayload>;
    onSubmit: (payload: FormSubmissionPayload) => Promise<void> | void;
    /**
     * Called with the filtered payload that contains only fields belonging
     * to pages the user actually visited. Useful for server-side validation
     * that should reject skipped-page fields.
     */
    onSpecPayload?: (payload: FormSubmissionPayload) => void;
    disabled?: boolean;
    mode?: 'standalone' | 'embed' | 'preview';
    /** Optional base URL forwarded to the injected payment component. */
    apiBaseUrl?: string;
}
export declare function Form({ spec, defaultValues, onSubmit, onSpecPayload, disabled, mode, apiBaseUrl, }: FormProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Form.d.ts.map