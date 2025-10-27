import { ArrowBigDown, Grip } from "lucide-react";
import type { DragItem } from "../../types/form";

interface DraggableComponentProps {
  item: DragItem;
}

export const DraggableComponent = ({ item }: DraggableComponentProps) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    
    
    <div
      draggable
      onDragStart={handleDragStart}
      className="group flex items-center gap-3 p-2 bg-card border border-gray-200  rounded-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:border-primary/30 transition-all duration-200"
    >
      {/* <div className="flex-shrink-0 w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        <span className="text-sm">{item.icon}</span>
      </div> */}
      
        <h4 className="font-semibold text-gray-700 text-sm text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
          <span className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center"> <Grip  className="w-4 h-4" /></span>
        {item.type}
        </h4>
      
    </div>
    
  );
};