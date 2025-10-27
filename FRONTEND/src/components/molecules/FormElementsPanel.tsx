import React from 'react';

export interface FormElement {
  id: number;
  type: string;
}

const formOptions: FormElement[] = [
  { id: 1, type: 'Text Input' },
  { id: 2, type: 'Checkbox' },
  { id: 3, type: 'Radio Button' },
];

const FormElementsPanel: React.FC = () => {
  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    element: FormElement
  ) => {
    event.dataTransfer.setData('application/json', JSON.stringify(element));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      style={{
        width: '250px',
        borderLeft: '2px solid #ddd',
        padding: '15px',
        backgroundColor: '#f4f4f4',
      }}
    >
      <h3 style={{ textAlign: 'center' }}>Form Elements</h3>
      {formOptions.map((element) => (
        <div
          key={element.id}
          draggable
          onDragStart={(e) => handleDragStart(e, element)}
          style={{
            padding: '10px',
            margin: '10px 0',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: '#fff',
            cursor: 'grab',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          {element.type}
        </div>
      ))}
    </div>
  );
};

export default FormElementsPanel;
