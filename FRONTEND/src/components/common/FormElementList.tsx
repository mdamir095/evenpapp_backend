import React from 'react';
import DraggableItem from './DraggableItem';
import type { FieldType } from './FormBuilder';

const elements: FieldType[] = ['text', 'number', 'date', 'dropdown', 'checkbox', 'radio'];

const FormElementList: React.FC = () => (
  <div className="sidebar">
    <h2>Form Elements</h2>
    {elements.map((type) => (
      <DraggableItem key={type} type={type} />
    ))}
  </div>
);

export default FormElementList;
