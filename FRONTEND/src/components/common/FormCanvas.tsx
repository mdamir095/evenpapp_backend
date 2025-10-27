import React, { useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import FormFieldCard from './FormFieldCard';
import { ItemTypes, type DragItem, type FormField } from './FormBuilder';

interface Props {
  fields: FormField[];
  selectedFieldId: string | null;
  onSelectField: (id: string) => void;
  onDropField: (type: DragItem['fieldType']) => void;
}

const FormCanvas: React.FC<Props> = ({
  fields,
  selectedFieldId,
  onSelectField,
  onDropField,
}) => {
  const dropRef = useRef<HTMLDivElement | null>(null);

const [, drop] = useDrop<DragItem>(() => ({
  accept: ItemTypes.FORM_ELEMENT,
  drop: (item) => {
    onDropField(item.fieldType);
  },
}));

  useEffect(() => {
    if (dropRef.current) {
      drop(dropRef.current);
    }
  }, [drop]);

  return (
    <div ref={dropRef} className="canvas">
      <h2>Form Builder Canvas</h2>
      {fields.map((field) => (
  <FormFieldCard
    key={field.id}
    field={field}
    isSelected={selectedFieldId === field.id}
    onClick={() => onSelectField(field.id)}
  />
))}
    </div>
  );
};

export default FormCanvas;
