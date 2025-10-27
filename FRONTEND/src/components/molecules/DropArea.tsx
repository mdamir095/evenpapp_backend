import React from 'react';
import type { FormElement } from '../../features/forms';

interface DropAreaProps {
  stackedElements: FormElement[];
  onDropElement: (element: FormElement) => void;
}

const DropArea: React.FC<DropAreaProps> = ({ stackedElements, onDropElement }) => {
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    const data = event.dataTransfer.getData('application/json');
    if (data) {
      const element: FormElement = JSON.parse(data);
      onDropElement(element);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div
      style={{
        flex: 1,
        border: '2px dashed #aaa',
        margin: '10px',
        padding: '10px',
        overflowY: 'auto',
        backgroundColor: '#fafafa',
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <h3 style={{ textAlign: 'center' }}>Drop Form Elements Here</h3>
      {stackedElements.length === 0 && (
        <p style={{ textAlign: 'center', color: '#888' }}>Drag elements from the right panel</p>
      )}
      {stackedElements.map((el) => (
        <div
          key={el.id}
          style={{
            padding: '8px',
            margin: '8px 0',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: '#fff',
          }}
        >
          {el.type}
        </div>
      ))}
    </div>
  );
};

export default DropArea;
