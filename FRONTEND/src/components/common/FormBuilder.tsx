import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import FormElementList from './FormElementList';
import FormCanvas from './FormCanvas';
import PropertiesPanel from './PropertiesPanel';

export type FieldType = 'text' | 'number' | 'date' | 'dropdown' | 'checkbox' | 'radio';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  options?: string[];
}

export interface DragItem {
  type: 'FORM_ELEMENT';
  fieldType: FieldType;
}

export const ItemTypes = {
  FORM_ELEMENT: 'FORM_ELEMENT',
} as const;




const FormBuilder: React.FC = () => {
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

const addField = (type: FieldType) => {
  const needsOptions = ['checkbox', 'radio', 'dropdown'].includes(type);
  const newField: FormField = {
    id: Date.now().toString(),
    type,
    label: `${type} field`,
    ...(needsOptions && { options: ['Option 1', 'Option 2'] }),
  };
  setFormFields((prev) => [...prev, newField]);
};



  const updateField = (updatedField: FormField) => {
    setFormFields((prev) =>
      prev.map((field) => (field.id === updatedField.id ? updatedField : field))
    );
  };

  const selectedField = formFields.find((field) => field.id === selectedFieldId) || null;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="form-builder-container">
        <FormElementList />
        <FormCanvas
          fields={formFields}
          selectedFieldId={selectedFieldId}
          onSelectField={setSelectedFieldId}
          onDropField={addField}
        />
        <PropertiesPanel field={selectedField} onUpdateField={updateField} />
      </div>
    </DndProvider>
  );
};

export default FormBuilder;
