import React from 'react';
import type { FormField } from './FormBuilder';

interface Props {
  field: FormField;
  isSelected: boolean;
  onClick: () => void;
}

const FormFieldCard: React.FC<Props> = ({ field, isSelected, onClick }) => {
  return (
    <div
      className={`form-field ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <label className="block mb-2 font-semibold text-gray-800 text-sm " >{field.label}</label>
      <div className="field-placeholder">
        {getFieldPlaceholder(field.type)}
      </div>
    </div>
  );
};

export default FormFieldCard;

function getFieldPlaceholder(type: FormField['type']): string {
  switch (type) {
    case 'text':
      return 'Text input';
    case 'number':
      return 'Number input';
    case 'date':
      return 'Date picker';
    case 'dropdown':
      return 'Dropdown select';
    case 'checkbox':
      return 'Checkbox';
    case 'radio':
      return 'Radio button';
    default:
      return 'Field';
  }
}
