import React from 'react';
import type { FormField } from './FormBuilder';
import Input from '../atoms/Input';

interface Props {
  field: FormField | null;
  onUpdateField: (field: FormField) => void;
}

const PropertiesPanel: React.FC<Props> = ({ field, onUpdateField }) => {
  if (!field) {
    return (
      <div className="p-4 border-l w-64 bg-gray-50 properties">
      <h3 className="font-semibold mb-2">Properties Panel</h3>
        <p>Select an element to edit its properties</p>
      </div>
    );
  }

  return (
    <div className="properties">
      <h2>Properties Panel</h2>
       <label className="block mb-2 font-semibold text-gray-800 text-sm " >Label</label>
      <Input
        type="text"
        value={field.label}
         className="w-full px-2 py-1 border border-gray-300 rounded-md"
        onChange={(e) => onUpdateField({ ...field, label: e.target.value })}
      />
    </div>
  );
};

export default PropertiesPanel;
