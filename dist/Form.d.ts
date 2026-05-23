import type { FormSpec, FormSubmissionPayload } from './types.js';
export interface FormProps {
    spec: FormSpec;
    defaultValues?: Partial<FormSubmissionPayload>;
    onSubmit: (payload: FormSubmissionPayload) => Promise<void> | void;
    disabled?: boolean;
    mode?: 'standalone' | 'embed' | 'preview';
}
export declare function Form({ spec, defaultValues, onSubmit, disabled, mode, }: FormProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Form.d.ts.map