
import { useState } from 'react';
import type { FormField } from '../../types/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { SelectGroup, type OptionType } from '../molecules/SelectGroup';
import { FileTerminalIcon } from 'lucide-react';

interface FormPreviewProps {
  fields: FormField[];
  title?: string;
  description?: string;
}

export const FormPreview = ({ fields, title = "Preview Form", description }: FormPreviewProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Form submitted successfully!');
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id] || '';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            rows={3}
          />
        );
      
      case 'select':
        return (
          <SelectGroup label={''} options={[]} value={[]} onChange={function (value: OptionType[]): void {
            throw new Error('Function not implemented.');
          } }>
            
          </SelectGroup>
          // <Select
          //   value={value}
          //   onValueChange={(val) => handleInputChange(field.id, val)}
          //   required={field.required}
          // >
          //   <SelectTrigger>
          //     <SelectValue placeholder="Select an option..." />
          //   </SelectTrigger>
          //   <SelectContent>
          //     {field.options?.map((option, index) => (
          //       <SelectItem key={index} value={option}>
          //         {option}
          //       </SelectItem>
          //     ))}
          //   </SelectContent>
          // </Select>
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={value || false}
              onCheckedChange={(checked) => handleInputChange(field.id, checked)}
              required={field.required}
            />
            <Label htmlFor={field.id} className='text-sm font-semibold'>{field.label}</Label>
          </div>
        );
      
      case 'radio':
        return (
          <RadioGroup
            value={value}
            onValueChange={(val) => handleInputChange(field.id, val)}
            required={field.required}
          >
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${index}`} />
                <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      
      default:
        return null;
    }
  };

  if (fields.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-none">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4  flex items-center justify-center">
            <FileTerminalIcon className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No Preview Available</h3>
            <p className="text-muted-foreground">Add some fields to see the form preview</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border-none">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
      
        <form onSubmit={handleSubmit} className="space-y-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field) => (
            <div key={field.id} className="space-y-2">
              {field.type !== 'checkbox' && (
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  {field.label}
                  {field.required && <span className="text-red-50">*</span>}
                </Label>
              )}
              {renderField(field)}
            </div>
          ))}
          </div>
          <div className="pt-4 m-auto text-center">
            <Button type="submit" className="w-auto m-auto" size="sm" variant="default">
              Submit Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};