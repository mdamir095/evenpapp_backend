import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import type { FormField } from '../../types/form';
import { Button } from '../atoms/Button';
import { CheckboxWithLabel } from '../molecules/CheckboxWithLabel';
import MultiImageUpload from '../atoms/MultiImageUpload';
import AddressComponent from '../common/AddressComponent';

type FieldType = 'ImageUpload' | 'MultiImageUpload' | 'Address' | 'date-range' | 'text' | 'email' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'dropdown' | 'toggle' | 'button' | 'button-group' | 'multi-select';
interface FormFieldComponentProps {
  field: FormField ;
  isSelected?: boolean;
  className?: string;
  onChange?: (value: any) => void;
  type: FieldType;
  value?: any;
  showPropertiesPanel?: boolean;
  setShowPropertiesPanel?: (show: boolean) => void;
}

export const FormFieldComponent = ({ 
  field, 
  isSelected = false, 
  value, 
  onChange, 
  showPropertiesPanel = false, 
  setShowPropertiesPanel 
}: FormFieldComponentProps) => {
  const renderFieldPreview = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <Input
            type={field.type}
            disabled
            placeholder={field.placeholder}
            className="cursor-pointer"
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
          />
        );

      case 'date':
        return (
          <Input
            disabled
            type="date"
            placeholder={field.placeholder}
            className="cursor-pointer"
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
          />
        );

      case 'textarea':
        return (
          <Textarea
            disabled
            placeholder={field.placeholder}
            className="cursor-pointer resize-none"
            rows={3}
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
          />
        );

      case 'select':
      case 'dropdown':
        return (
          <Select value={value} onValueChange={onChange} disabled={true}>
            <SelectTrigger className="cursor-pointer bg-white font-bold text-gray-800 border border-gray-300">
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent className="bg-white font-bold text-gray-800">
              {(field?.options?.length ? field?.options : field?.metadata?.options || [])
                .filter((option: any) => option && option.trim() !== '') // Filter out empty or whitespace-only options
                .map((option: any, index: any) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2" onClick={() => setShowPropertiesPanel?.(!showPropertiesPanel)}  title={showPropertiesPanel ? "Hide Properties Panel" : "Show Properties Panel"}>
            {Array.isArray(field?.metadata?.options) &&
              field?.metadata?.options
                .map((option: any) => (
                  <>
                  <CheckboxWithLabel
                      label={option}
                      checked={value || false}
                      onChange={(checked: boolean) => onChange?.(checked)} id={''} name={''}         />
                  {/* <Checkbox
                    disabled
                    id={field.id}
                    checked={value || false}
                    onCheckedChange={onChange} />
                    <Label htmlFor={field.id} className="text-sm font-semibold text-gray-800 cursor-pointer whitespace-nowrap">
                      {option}
                    </Label> */}
                    </>
                ))}
          </div>
        );

      case 'radio':
        return (
          <RadioGroup value={value} onValueChange={onChange}>
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${index}`} />
                <Label htmlFor={`${field.id}-${index}`} className=" text-sm font-semibold text-gray-800 cursor-pointer capitalize mb-1">
                  {option}
                </Label>
              
              </div>
            ))}
          </RadioGroup>
        );

      case 'toggle':
        return (
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              onClick={() => onChange?.(!value)}
              className={`relative inline-flex h-6 w-11 items-center  transition-colors focus:outline-none focus:ring-0 focus:ring-primary focus:ring-offset-0 ${value ? 'primary' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              role="switch"
              aria-checked={value}
            >
              <span
                className={`inline-block h-4 w-4 transform  bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </Button>
            <Label className="font-semibold text-sm text-gray-800 mb-2 cursor-pointer">
              {field.label}
            </Label>
          </div>
        );
              case 'button':
            return (
                <div className="col-span-1">
                    <Button
                        id={field.id}
                        type="button"
                        onClick={() => onChange && onChange(field.id)}
                        className="px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-0 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                        {field.label}
                    </Button>

                </div>
            );

        case 'button-group':
        // case 'multi-select':
            const groupValues = Array.isArray(value) ? value : [''];
            return (
                <div className="space-y-2">
                    {groupValues.map((val: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input
                                disabled
                                type="text"
                                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                                value={val || ''}
                                onChange={(e) => {
                                    const newValues = [...groupValues];
                                    newValues[index] = e.target.value;
                                    onChange?.(newValues);
                                }}
                                className="cursor-pointer"
                            />
                            {index > 0 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newValues = groupValues.filter((_: any, i: number) => i !== index);
                                        onChange?.(newValues.length > 0 ? newValues : ['']);
                                    }}
                                    className="px-2 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                    title="Remove field"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant='muted'
                        onClick={() => {
                            const newValues = [...groupValues, ''];
                            onChange?.(newValues);
                        }}
                        className="flex items-center gap-1 px-3 py-1  rounded text-sm font-medium"
                    >
                        <span className="text-lg">+</span>
                        Add More
                    </Button>
                </div>
            );
            
            
            case 'MultiImageUpload':
                return (
                    <div className="space-y-2">
                        <MultiImageUpload
                            isSingleMode={false}
                            onImagesChange={onChange}
                            disableClick={isSelected ? false : true} // Enable click when selected, disable when not selected
                        />
                    </div>
                );
                case 'Address':
                    return (
                        <div className="space-y-2">
                            <AddressComponent
                                onChange={(address) => onChange?.(address)}
                            />
                        </div>
                    );
              
        case 'date-range':
            const dateRange = value || { startDate: '', endDate: '' };
            return (
                <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-semibold text-gray-800 text-sm mb-2">Start Date</label>
                            <Input
                                disabled
                                type="date"
                                value={dateRange.startDate || ''}
                                onChange={(e) => {
                                    onChange?.({
                                        ...dateRange,
                                        startDate: e.target.value
                                    });
                                }}
                                className="cursor-pointer"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-gray-800 text-sm mb-2">End Date</label>
                            <Input
                                disabled
                                type="date"
                                value={dateRange.endDate || ''}
                                onChange={(e) => {
                                    onChange?.({
                                        ...dateRange,
                                        endDate: e.target.value
                                    });
                                }}
                                className="cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            );

      default:
        return null;
    }
  };

  return (
    <div
      className={`p-4 bg-card  form-builderFroms border  border-gray-200 rounded-lg transition-all duration-200 
        w-full hover:shadow-md ${isSelected
        ? 'border-primary shadow-md'
        : 'border-border hover:border-primary/30'
        }`}
    >
      <div className="space-y-2">
        <Label className="flex items-center gap-2  mb-2 font-semibold text-gray-800 text-sm">
          {field.label}
          {field.required && <span className="text-red-50">*</span>}
          {isSelected && (
            <span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-1 rounded-md">
              Selected
            </span>
          )}
        </Label>

        {field.type !== 'checkbox' && renderFieldPreview()}
        {field.type === 'checkbox' && renderFieldPreview()}
      </div>
    </div>
  );
};