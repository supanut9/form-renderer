import { type Control } from 'react-hook-form';
import type { EmailField, PhoneField, TextField as TextFieldType } from '../types.js';
interface Props {
    field: TextFieldType | EmailField | PhoneField;
    control: Control;
    disabled?: boolean;
}
export declare function TextField({ field, control, disabled }: Props): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=TextField.d.ts.map