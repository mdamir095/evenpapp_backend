import React, { useRef, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { ItemTypes, type DragItem, type FieldType } from './FormBuilder';

interface Props {
  type: FieldType;
}

const DraggableItem: React.FC<Props> = ({ type }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const [, drag] = useDrag<DragItem>(() => ({
    type: ItemTypes.FORM_ELEMENT,
    fieldType: type,
  }));

  useEffect(() => {
    if (ref.current) {
      drag(ref.current);
    }
  }, [drag]);

  return (
    <div ref={ref} className="draggable-item">
      {type}
    </div>
  );
};

export default DraggableItem;
