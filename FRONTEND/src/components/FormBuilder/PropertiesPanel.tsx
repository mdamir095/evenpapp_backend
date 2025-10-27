import React, { constructor, useState } from 'react';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { Button } from '../../components/ui/button';
import { Plus, X, Settings } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import type { FormField } from '../../types/form';
import { CheckboxWithLabel } from '../molecules/CheckboxWithLabel';
import type { Header } from '@radix-ui/react-accordion';

interface PropertiesPanelProps {
  selectedField: FormField| null;
  onFieldUpdate: (fieldId: string, updates: Partial<FormField>) => void;
  setShowPropertiesPanel: (show: boolean) => void;
}

export const PropertiesPanel = ({ selectedField, onFieldUpdate, setShowPropertiesPanel }: PropertiesPanelProps) => {
  const [newOption, setNewOption] = useState('');

  if (!selectedField) {
    return (
      <div className="bg-sidebar-bg">
        <div className='flex items-center justify-between'>
          <h2 className="text-lg font-semibold">Field Properties</h2>
          <X className='w-7 h-7 cursor-pointer' onClick={() => setShowPropertiesPanel(false)} />
        </div>
        
        <div className="text-center py-12 ">
          <div className="w-10 h-10 mx-auto mb-4 bg-gray-200 rounded-md flex items-center justify-center">
            <Settings className="h-6 w-6 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Field Selected</h3>
          <p className="text-sm text-gray-600">
            Select a field from the canvas to edit its properties
          </p>
        </div>
      </div>
    );
  }

  // Handle cases where options come from metadata.options - copy them to main options
  if (selectedField.metadata?.options && !selectedField.options) {
    onFieldUpdate(selectedField.id, { options: selectedField.metadata.options });
  }

  const addOption = () => {
    if (newOption.trim()) {
      const currentOptions = selectedField.options || [];
      const updatedOptions = [...currentOptions, newOption.trim()];
      if(selectedField?.metadata?.options){
        selectedField.metadata.options.push(newOption.trim());
      }
      onFieldUpdate(selectedField.id, { options: updatedOptions });
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    if (selectedField.options) {
      const updatedOptions = selectedField.options.filter((_, i) => i !== index);
      if(selectedField?.metadata?.options){
        selectedField.metadata.options = updatedOptions;
      }
      onFieldUpdate(selectedField.id, { options: updatedOptions });
    }
  };

  const updateOption = (index: number, value: string) => {
    if (selectedField.options) {
      const updatedOptions = [...selectedField.options];
      updatedOptions[index] = value;
      onFieldUpdate(selectedField.id, { options: updatedOptions });
    }
  };

  return (
    <div className="bg-sidebar-bg">
      <div className='flex items-center justify-between mb-4'>
        <h2 className="text-lg font-semibold">Field Properties</h2>
        <X className='w-7 h-7 cursor-pointer' onClick={() => setShowPropertiesPanel(false)} />
      </div>

      <div className="space-y-4 col-start-1 row-start-1 grid grid-cols-1 mt-6 gap-4 overflow-y-auto">
        {/* Field Type */}
        <div>
          <Label htmlFor="field-type">Field Type</Label>
          <Select
            value={selectedField.type}
            onValueChange={(value: string) =>
              onFieldUpdate(selectedField.id, {
                type: value as FormField["type"],
                options:
                  value === "select" || value === "radio" || value === "checkbox"
                    ? ["Option 1", "Option 2"]
                    : undefined,
              })
            }
          >
            <SelectTrigger className="w-full border border-gray-300 bg-white text-black focus:border-blue-500 cursor-pointer">
              <SelectValue placeholder="Select field type" />
            </SelectTrigger>

            <SelectContent className="bg-white text-black cursor-pointer">
              <SelectItem value="text">Text Input</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="textarea">Text Area</SelectItem>
              <SelectItem value="select">Dropdown</SelectItem>
              <SelectItem value="radio">Radio Buttons</SelectItem>
              <SelectItem value="checkbox">Checkbox</SelectItem>
              <SelectItem value="MultiImageUpload">Multi Image Upload</SelectItem>
              <SelectItem value="date-range">Date Range</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="button">Button</SelectItem>
              <SelectItem value="button-group">Button Group</SelectItem>
                <SelectItem value="multi-select">Multi Select</SelectItem>
                <SelectItem value="multi-select">Multi Select</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Field Label */}
        <div>
          <Label htmlFor="field-label">Field Label</Label>
          <Input
            id="field-label"
            value={selectedField.label}
            className='w-full px-2 py-2 border rounded'
            onChange={(e) => onFieldUpdate(selectedField.id, { label: e.target.value })}
            placeholder="Enter field label..."
          />
        </div>

        {/* Placeholder (for applicable fields) */}
        {(selectedField.type === 'text' || 
          selectedField.type === 'email' || 
          selectedField.type === 'number' || 
          selectedField.type === 'textarea' ||
          selectedField.type === 'MultiImageUpload' ||
          selectedField.type === 'date-range' ||
          selectedField.type === 'button'  ||
          selectedField.type === 'date' ||
          selectedField.type === 'Address' ||
          selectedField.type === 'button-group') && (
          <div>
            <Label htmlFor="field-placeholder">Placeholder</Label>
            <Input
              id="field-placeholder"
              value={selectedField.placeholder || ''}
              onChange={(e) => onFieldUpdate(selectedField.id, { placeholder: e.target.value })}
              placeholder="Enter placeholder text..."
            />
          </div>
        )}

        {/* Options (for select and radio) */}
        {(selectedField.type === 'select' || selectedField.type === 'radio' || selectedField.type === 'checkbox') && (
          <div>
            <Label className=" font-semibold text-gray-800 text-sm' mb-3 block">Options</Label>
            <div className="space-y-3">
              {selectedField.options?.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder="Option text..."
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                    className="h-9 w-9 p-0 text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <div className="flex items-center gap-2">
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Add new option..."
                  onKeyPress={(e) => e.key === 'Enter' && addOption()}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addOption}
                  className="h-9 w-9 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
        {(selectedField.type === 'MultiImageUpload' ) && (
                  <div>
                    <Label className=" font-semibold text-gray-800 text-sm' mb-3 block">image</Label>
                    <div className="space-y-3">
                      {selectedField.options?.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            placeholder="Option text..."
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(index)}
                            className="h-9 w-9 p-0 text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      
                      <div className="flex items-center gap-2">
                        <Input
                          value={newOption}
                          onChange={(e) => setNewOption(e.target.value)}
                          placeholder="Add new option..."
                          onKeyPress={(e) => e.key === 'Enter' && addOption()}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={addOption}
                          className="h-9 w-9 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
        {/* Required Field */}
        <div className="flex items-center space-x-2">
          <CheckboxWithLabel 
            label="Required field" 
            checked={selectedField.required || false} 
            onChange={(checked) => onFieldUpdate(selectedField.id, { required: !!checked })} 
            id={`required-${selectedField.id}`} 
            name={`required-${selectedField.id}`}
          />
        </div>


        {/* Field Info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-sm text-gray-900 mb-2">Field Info</h4>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span className=' font-semibold text-gray-800 text-sm'>Field ID:</span>
              <code className="bg-gray-200 px-1 rounded">{selectedField.id}</code>
            </div>
            <div className="flex justify-between  font-semibold text-gray-800 text-sm">
              <span className=' font-semibold text-gray-800 text-sm'>Type:</span>
              <span className="capitalize">{selectedField.type}</span>
            </div>
            {selectedField.options && (
              <div className="flex justify-between">
                <span className=' font-semibold text-gray-800 text-sm'>Options:</span>
                <span className=' font-semibold text-gray-800 text-sm'>{selectedField.options.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};