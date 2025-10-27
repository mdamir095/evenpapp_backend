import { useEffect, useState } from 'react';
import { FormFieldComponent } from './FormFieldComponent';
import { Button } from '../../components/ui/button';
import { Trash2, Send, Edit2Icon, SquarePen, Eye } from 'lucide-react';
import type { FormField } from '../../types/form';
import { API_ROUTES, ROUTING } from '../../constants/routes';
import api from '../../axios';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useToast } from '../atoms/Toast';
import { Textarea } from '../atoms/Textarea';
import { Select } from '../atoms/Select';
import { SelectGroup, type OptionType } from '../molecules/SelectGroup';
import { SideModal } from '../common/SideModal';
import { PropertiesPanel } from './PropertiesPanel';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Label } from '../atoms/Label';
import { DropDown } from '../atoms/DropDown';
import { InputGroup } from '../molecules/InputGroup';
import Input from '../atoms/Input';

interface FormCanvasProps {
  fields: FormField[];
  onFieldsChange: (fields: FormField[]) => void;
  selectedFieldId: string | null;
  onFieldSelect: (fieldId: string | null) => void;
  className?: string;
}

export const FormCanvas = ({ fields, onFieldsChange, selectedFieldId, onFieldSelect }: FormCanvasProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formName, setFormName] = useState('');
  const [getCategoryId, setCategoryId] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [getEditKey, setEditKey] = useState('');
 const toast = useToast();
 const navigate = useNavigate();
  const serviceType = [
    {
      name: "venue-category",
      value: "venue-category"
    },
    {
      name: "vendor-service",
      value: "vendor-service"
    }
  ]
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  // const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id'); // Get the 'id' from query params

  useEffect(() => {
    if (!id) return;

    const timeout = setTimeout(async () => {
      const response = await api.get(`${API_ROUTES.GET_ALL_FORM_BUILDER_LIST}/${id}`);
      if (response?.data?.data) {
        setEditKey(response.data.data.key);
        updateRecord(response.data.data);
        setCategoryId(response?.data?.data?.categoryId);
      }
    }, 500); // debounce delay
    return () => clearTimeout(timeout); // cleanup
  }, [id]);

  useEffect(() => {
      if (serviceType && serviceType.length > 0 && !id) {
        setCategoryId(serviceType[0].value);
      }
    }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    try {
      const dragData = e.dataTransfer.getData('text/plain');
      const item = JSON.parse(dragData);

      // Check if it's a new component from sidebar or existing field reorder
      if (item.isExistingField) {
        // Handle field reordering
        const draggedFieldId = item.fieldId;
        const dropTarget = e.target as HTMLElement;
        const dropZone = dropTarget.closest('[data-field-id]');

        if (dropZone) {
          const targetFieldId = dropZone.getAttribute('data-field-id');
          if (targetFieldId && targetFieldId !== draggedFieldId) {
            reorderFields(draggedFieldId, targetFieldId);
          }
        }
      } else {
        // Handle new field from sidebar
        const newField: FormField = {
          id: `field_${Date.now()}`,
          type: item.type,
          label: item.name,
          placeholder: `Enter ${item?.metadata?.placeholder?.toLowerCase()}...`,
          required: false,
          options: item.type === 'select' || item.type === 'radio' ? ['Option 1', 'Option 2'] : undefined,
          metadata: item?.metadata,
          validation: item?.validation,
        };

        onFieldsChange([...fields, newField]);
      }
    } catch (error) {
      // Error dropping field
    }
  };

  const updateRecord = (data: any) => {
    setFormName(data?.name)
    setFormDescription(data?.description)
    let newRecord: any = []
    for (let index = 0; index < data?.fields?.length; index++) {
      let item = data?.fields[index]
      let newField: FormField = {
        id: item?.id,
        type: item.type,
        label: item.name,
        placeholder: `Enter ${item?.metadata?.placeholder?.toLowerCase()}...`,
        required: false,
        options: item.type === 'select' || item.type === 'radio' ? ['Option 1', 'Option 2'] : undefined,
        metadata: item?.metadata,
        validation: item?.validation,
        order: item?.order,
      };
      newRecord.push(newField)
    }
    onFieldsChange(newRecord);
  }

  const reorderFields = (draggedFieldId: string, targetFieldId: string) => {
    const draggedIndex = fields.findIndex(field => field.id === draggedFieldId);
    const targetIndex = fields.findIndex(field => field.id === targetFieldId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const reorderedFields = [...fields];
    const [draggedField] = reorderedFields.splice(draggedIndex, 1);
    reorderedFields.splice(targetIndex, 0, draggedField);

    onFieldsChange(reorderedFields);
  };

  const handleFieldDragStart = (e: React.DragEvent, fieldId: string) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      isExistingField: true,
      fieldId: fieldId
    }));
  };

  const removeField = (fieldId: string) => {
    onFieldsChange(fields.filter(field => field.id !== fieldId));
    if (selectedFieldId === fieldId) {
      onFieldSelect(null);
    }
  };
 
  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    onFieldsChange(fields.map(field =>
      field.id === fieldId ? { ...field, ...updates } : field
    ));
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  // Utility function to fix validation data before submission
  const fixValidationData = (field: FormField) => {
    if (!field.validation) return field.validation;
    
    const fixedValidation = {
      ...field.validation,
      invalidType: field.validation.invalidType ? {
        ...field.validation.invalidType,
        value: Array.isArray(field.validation.invalidType.value) 
          ? field.validation.invalidType.value.join(',') 
          : field.validation.invalidType.value
      } : field.validation.invalidType
    };
    
    return fixedValidation;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formName.trim()) {
        toast.error('Please enter a form name');
        return;
      }

      const requiredFields = fields.filter(field => field.required);
      const missingFields = requiredFields.filter(field => !formData[field.id]);

      if (missingFields.length > 0) {
        alert(`Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`);
        return;
      }

      const updatedFields = fields.map((field, index: number) => ({
        ...field,
        key: `${field.type}`,
        name: `${field.label}`,
        order: field.order ? field.order : field.metadata.order,
        validation: fixValidationData(field),
        // or use index or a UUID here if preferred
      }));

      // Prepare submission data
      const submissionData = {
        categoryId: getCategoryId,
        name: formName || 'Untitled Form',
        description: formDescription || 'Form created with FormBuilder',
        formId: 'dynamic-form',
        timestamp: new Date().toISOString(),
        // data: formData,
        fields: updatedFields,
        type: getCategoryId
      };

      // Here you can add your API call to submit the form data
      // Example:
      // const response = await api.post('/forms/submit', submissionData);

      // For now, just show success message
      let response
      try {
        if (id) {
          response = await api.put(`${API_ROUTES.SUBMIT_FIELDS}/${getEditKey}`, submissionData);
        }
        else {
          response = await api.post(API_ROUTES.SUBMIT_FIELDS, submissionData);
        }
        if (response?.data?.data) {
          setFormName('');
          setFormDescription('');
          toast.success('Form added successfully.');
           navigate(ROUTING.FORM_LIST);
        }
        // Handle the response data here
        // You can set state or process the data as needed
      } catch (error) {
        // Fetch error
      }

      // Reset form data
      setFormData({});
      setFormName('');
      setFormDescription('');

    } catch (error) {
      alert('Error submitting form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

 

  return (
    <div className="flex-1 p-6 bg-canvas-bg border-gray-300 bg-no-repeat" style={{ backgroundImage: "url('/assets/images/form-builderbg.png')" }}>
      <div className="grid grid-cols-1">
        <form onSubmit={handleSubmit}>
          {/* Form Name and Description Fields */}
          <div className="mb-6 space-y-4 col-start-1 row-start-1 grid grid-cols-2 gap-4">
            <div className='w-full'>
              <Label htmlFor="categoryId" className="block text-sm font-semibold text-gray-800 mb-2">
                Select Category<span className='text-red-500'>*</span>
              </Label>
              <DropDown 
                className={`categoryDropdown`}
                options={(serviceType || []).map((opt: any) => ({
                  label: opt.name,
                  value: opt.value,
                }))}
                value={getCategoryId}
                onChange={(value) => {
                  setCategoryId(value);
                  // Clear error when user selects a category
                 
                }}
              />
              {/* {formErrors.categoryId && (
                <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                  <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  {formErrors.categoryId}
                </div>
              )} */}
              {/* <SelectGroup
                  label=""
                  options={(serviceType || []).map((opt: any) => ({
                    label: opt.name,
                    value: opt.value,
                  }))}
                  value={
                    getCategoryId
                      ? [
                          {
                            label:
                              serviceType.find((opt: any) => opt.value === getCategoryId)?.name ||
                              "",
                            value: getCategoryId,
                          },
                        ]
                      : []
                  }
                  onChange={(selected: OptionType[]) => {
                    setCategoryId(selected.length ? selected[0].value : "");
                  }}
                /> */}

            </div>
            <div>
              <label htmlFor="formName" className="block text-sm font-semibold text-gray-800 mb-2">
                Form Name<span className='text-red-500'>*</span>
              </label>
              <Input
                id="formName"
                type="text"
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                  // Clear error when user starts typing
                  
                }}
                placeholder="Enter form name"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-0 focus:ring-opacity-50 transition-colors duration-200 ${
               formName.length > 0 ? 'border-primary' : 'border-gray-300'
               }`}
                required
              />
            </div>

            <div className='w-full'>
              <label htmlFor="formDescription" className="block text-sm font-semibold text-gray-800 mb-2">
                Form Description
              </label>
              <Textarea
                id="formDescription"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Enter form description (optional)"
                rows={3}
                className="w-full px-3 py-2 border  rounded-md focus:outline-none  focus:ring-primary  resize-none   text-gray-900 border-gray-300 focus:ring-blue-500 focus:border-blue-500 light:bg-white dark:text-white light:border-gray-700 light:focus:ring-blue-400"
              />
            </div>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`min-h-[400px] border-1 rounded-md border-gray-300 border-dashed p-0 transition-all duration-200 ${dragOver
              ? 'border-primary bg-drop-zone'
              : fields.length === 0
                ? 'border-border bg-muted/20'
                : 'border-transparent bg-card form-builderFroms'
              }`}
          >
            <div className="mb-6 space-y-4 col-start-1 row-start-1 grid grid-cols-1 gap-4">
            {fields.length === 0 ? (
              <div className="text-center py-20">
                <div className=" flex-col mx-auto mb-4 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-2xl"><SquarePen /></span>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Start Building Your Form</h3>
                  <p className="text-muted-foreground">Drag form components here to get started</p>
                </div>
               
              </div>
            ) : (
              <div className="space-y-0 col-start-1 row-start-1 grid grid-cols-2 gap-4">
                {fields.map((field, index) => (
                 
                  <div
                    key={field.id}
                    data-field-id={field.id}
                    draggable
                    onDragStart={(e) => handleFieldDragStart(e, field.id)}
                    className={`group relative cursor-move transition-all duration-200 p-0 flex flex-row w-full gap-4 ${selectedFieldId === field.id
                      ? 'ring-0 ring-primary ring-offset-0'
                      : ''}`}
                    onClick={() => onFieldSelect(field.id)}
                  >
                   
                   
                    <FormFieldComponent
                      field={field}
                      isSelected={selectedFieldId === field.id}
                      value={formData[field.id]}
                      onChange={(value) => handleFieldChange(field.id, value)}
                      type={'number'}
                      showPropertiesPanel={showPropertiesPanel}
                      setShowPropertiesPanel={setShowPropertiesPanel}
                    />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-500 transition-opacity z-10  bg-white border border-[#DEDDE2] rounded-sm flex flex-col gap-1">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeField(field.id);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {/* <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsModalOpen(true); 
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2Icon className="h-4 w-4" />
                      </Button> */}
                      {/* <Button variant="default" size="sm" onClick={() => setShowPropertiesPanel(!showPropertiesPanel)}  title={showPropertiesPanel ? "Hide Properties Panel" : "Show Properties Panel"}className="flex items-center gap-1 whitespace-nowrap y-1"> <Settings className="h-4 w-4" />
          {showPropertiesPanel ? "Hide Properties" : "Show Properties"}</Button> */}
                      {/* <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button> */}
                    </div>
                  </div>
                 
                ))}

                
              </div>
            )}
            {/* Submit Button */}
            {fields.length > 0 && (
                  <div className="pt-6 border-t border-border border-gray-300">
                    {
                      id ? <Button
                        type="submit"
                        className="w-auto flex items-center gap-2 m-auto"
                        disabled={isSubmitting}
                      >
                        <Send className="h-4 w-4" />
                        {isSubmitting ? 'Updating...' : 'Update Form'}
                      </Button> : <Button
                        type="submit"
                        className="w-auto flex items-center gap-2"
                        disabled={isSubmitting}
                      >
                        <Send className="h-4 w-4" />
                        {isSubmitting ? 'Submitting...' : 'Submit Form'}
                      </Button>
                    }


                  </div>
                )}
            </div>
          </div>
        </form>

      </div>
    </div>
    
  );
};