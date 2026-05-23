import { jsx as _jsx } from "react/jsx-runtime";
import { TextField } from './TextField.js';
import { TextareaField } from './TextareaField.js';
import { NumberField } from './NumberField.js';
import { SelectField } from './SelectField.js';
import { MultiselectField } from './MultiselectField.js';
import { RadioField } from './RadioField.js';
import { CheckboxField } from './CheckboxField.js';
import { DateField } from './DateField.js';
import { FileField } from './FileField.js';
import { MatrixField } from './MatrixField.js';
export function FieldRenderer({ field, control, disabled }) {
    switch (field.type) {
        case 'text':
        case 'email':
        case 'phone':
            return _jsx(TextField, { field: field, control: control, disabled: disabled });
        case 'textarea':
            return _jsx(TextareaField, { field: field, control: control, disabled: disabled });
        case 'number':
            return _jsx(NumberField, { field: field, control: control, disabled: disabled });
        case 'select':
            return _jsx(SelectField, { field: field, control: control, disabled: disabled });
        case 'multiselect':
            return _jsx(MultiselectField, { field: field, control: control, disabled: disabled });
        case 'radio':
            return _jsx(RadioField, { field: field, control: control, disabled: disabled });
        case 'checkbox':
            return _jsx(CheckboxField, { field: field, control: control, disabled: disabled });
        case 'date':
            return _jsx(DateField, { field: field, control: control, disabled: disabled });
        case 'file':
            return _jsx(FileField, { field: field, control: control, disabled: disabled });
        case 'matrix':
            return _jsx(MatrixField, { field: field, control: control, disabled: disabled });
    }
}
