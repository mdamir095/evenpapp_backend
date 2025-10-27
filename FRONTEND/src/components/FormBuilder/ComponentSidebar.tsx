import { useEffect } from 'react';
import type { DragItem } from '../../types/form';
import { DraggableComponent } from './DraggableComponent';
import api from '../../axios';
import React from 'react';
import { API_ROUTES } from '../../constants/routes';

const FORM_COMPONENTS: DragItem[] = [
  { type: 'text', label: 'Text Input' },
  { type: 'email', label: 'Email' },
  { type: 'number', label: 'Number' },
  { type: 'date', label: 'Date' },
  { type: 'textarea', label: 'Text Area' },
  { type: 'select', label: 'Dropdown' },
  { type: 'radio', label: 'Radio Buttons' },
  { type: 'checkbox', label: 'Checkbox' },
  { type: 'toggle', label: 'Toggle Switch' },
];

export const ComponentSidebar = () => {

  const [getAllFields, setAllFields] = React.useState<DragItem[]>();

  useEffect(() => {
    const getFormFields = async () => {
      try {
        const response = await api.get(API_ROUTES.GET_ALL_FIELDS);
        if(response?.data?.data){
          if(response.data.data){
            response.data.data.forEach((element:any) => {
              element.metadata['order'] = Number(element?.order)
            });
          }
          setAllFields(response.data.data)
        }
        // Handle the response data here
        // You can set state or process the data as needed
      } catch (error) {
        // Fetch error
      }
    };

    // Call the function
    getFormFields();
  }, []);
  return (
    <div className="w-64 form-bulider-sidebar  border-gray-200  border-r border-border pr-4">
        <h2 className="text-lg font-semibold mb-4">Field Types</h2>

      <div className="space-y-3 text-gray-800 capitalize">
        <div className="overflow-y-auto space-y-3">
        {getAllFields?.map((component, index) => (
          <DraggableComponent key={index} item={component} />
        ))}
        </div>
      
      </div>

      {/* <div className="mt-8 p-4 bg-accent/30 rounded-lg">
        <h3 className="font-medium text-sm text-foreground mb-2">💡 Quick Tip</h3>
        <p className="text-xs text-muted-foreground">
          Click on any field in the canvas to edit its properties, including labels, placeholders, and options.
        </p>
      </div> */}
    </div>
  );
};