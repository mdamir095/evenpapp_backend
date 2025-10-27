import React from 'react';
import { Input } from '../atoms/Input';
import { SelectGroup } from '../molecules/SelectGroup';
import type { DynamicFormField } from '../../types/Vendor';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Button } from '../atoms/Button';
import MultiImageUpload from '../atoms/MultiImageUpload';

interface DynamicFieldRendererProps {
    field: DynamicFormField;
    value: any;
    onChange: (value: any) => void;
    error?: string;
}

const DynamicFieldForm: React.FC<DynamicFieldRendererProps> = ({
    field,
    value,
    onChange,
    error
}) => {
    // Use field.name if available, otherwise fall back to field.label
    const displayLabel = field.name || field.label;
    
    switch (field.type) {
        case 'text':
        case 'email':
        case 'number':
            return (
                <div className="col-span-1">
                    <label className="block mb-2 font-semibold text-gray-800 text-sm ">
                        {displayLabel} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <Input
                        id={field.id}
                        type={field.type}
                        placeholder={field.placeholder || `Enter ${displayLabel.toLowerCase()}`}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        error={error}
                    />
                    {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
                </div>
            );

        case 'textarea':
            return (
                <div className="col-span-1">
                    <label className="block mb-2 font-semibold text-gray-800 text-sm ">
                        {displayLabel} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                        id={field.id}
                        rows={4}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                            }`}
                        placeholder={field.placeholder || `Enter ${displayLabel.toLowerCase()}`}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                    />
                    {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
                </div>
            );

        case 'select':
        case 'dropdown':
            return (
                <div className="col-span-1">
                    <SelectGroup
                        label={displayLabel}
                        options={
                            Array.isArray(field.options)
                                ? field.options.map(opt =>
                                    typeof opt === "string"
                                        ? { label: opt, value: opt }
                                        : opt
                                )
                                : []
                        }
                        value={value ? [{ label: value, value: value }] : []}
                        onChange={(selected) => {
                            const selectedValue = Array.isArray(selected) ? selected[0]?.value : '';
                            onChange(selectedValue);
                        }}
                        isMulti={false}
                        error={error}
                    />
                </div>
            );

        case 'checkbox':
            return (
                <div className="col-span-1">
                    <label className="block mb-2 font-semibold text-gray-800 text-sm ">
                        {displayLabel} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <div className="space-y-2">
                        {Array.isArray(field.options) &&
                            field.options
                                .map(opt =>
                                    typeof opt === "string" ? { label: opt, value: opt } : opt
                                )
                                .map((option) => (
                                    <div key={option.value} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`${field.id}_${option.value}`}
                                            checked={Array.isArray(value) ? value.includes(option.value) : false}
                                            onChange={(e) => {
                                                const currentValues = Array.isArray(value) ? value : [];
                                                if (e.target.checked) {
                                                    onChange([...currentValues, option.value]);
                                                } else {
                                                    onChange(currentValues.filter((v: string) => v !== option.value));
                                                }
                                            }}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-sm"
                                        />
                                        <label
                                            htmlFor={`${field.id}_${option.value}`}
                                            className="ml-2 block text-sm text-gray-900 whitespace-nowrap"
                                        >
                                            {option.label}
                                        </label>
                                    </div>
                                ))}
                    </div>

                    {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
                </div>
            );

        case 'date':
            return (
                <div className="col-span-1">
                    <label className="block mb-2 font-semibold text-gray-800 text-sm whitespace-nowrap">
                        {displayLabel} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <Input
                        id={field.id}
                        type="date"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        error={error}
                    />
                    {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
                </div>
            );

        case 'radio':
            const normalizedOptions = (field.options || []).map((opt: any) =>
                typeof opt === "string" ? { label: opt, value: opt } : opt
            );
            return (
                <RadioGroup value={value} onValueChange={onChange}>
                    {normalizedOptions.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.value} id={`${field.id}-${index}`} />
                            <Label
                                htmlFor={`${field.id}-${index}`}
                                className="font-semibold text-gray-800 cursor-pointer"
                            >
                                {option.label}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            );

        case 'button':
            return (
                <div className="col-span-1">
                    <button
                        id={field.id}
                        type="button"
                        onClick={() => onChange && onChange(field.id)}
                        className="px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                        {displayLabel}
                    </button>
                    {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
                </div>
            );

        case 'button-group':
        case 'multi-select':
            const groupValues = Array.isArray(value) ? value : [''];
            return (
                <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {displayLabel} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <div className="space-y-2">
                        {groupValues.map((val: string, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input
                                    id={`${field.id}_${index}`}
                                    type="text"
                                    placeholder={field.placeholder || `Enter ${displayLabel.toLowerCase()}`}
                                    value={val || ''}
                                    onChange={(e) => {
                                        const newValues = [...groupValues];
                                        newValues[index] = e.target.value;
                                        onChange(newValues);
                                    }}
                                    error={error}
                                />
                                {index > 0 && (
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            const newValues = groupValues.filter((_: any, i: number) => i !== index);
                                            onChange(newValues.length > 0 ? newValues : ['']);
                                        }}
                                        className="px-2 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                        title="Remove field"
                                    >
                                        ✕
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button
                            type="button"
                            onClick={() => {
                                const newValues = [...groupValues, ''];
                                onChange(newValues);
                            }}
                            className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded text-sm font-medium"
                        >
                            <span className="text-lg">+</span>
                            Add More
                        </Button>
                    </div>
                    {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
                </div>
            );

        case 'date-range':
            const dateRange = value || { startDate: '', endDate: '' };
            return (
                <div className="col-span-1">
                    <label className="block mb-2 font-semibold text-gray-800 text-sm ">
                        {displayLabel} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                            <Input
                                id={`${field.id}_start`}
                                type="date"
                                value={dateRange.startDate || ''}
                                onChange={(e) => {
                                    onChange({
                                        ...dateRange,
                                        startDate: e.target.value
                                    });
                                }}
                                error={error}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">End Date</label>
                            <Input
                                id={`${field.id}_end`}
                                type="date"
                                value={dateRange.endDate || ''}
                                onChange={(e) => {
                                    onChange({
                                        ...dateRange,
                                        endDate: e.target.value
                                    });
                                }}
                                error={error}
                            />
                        </div>
                    </div>
                    {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
                </div>
            );

        case 'MultiImageUpload':
            return (
                <div className="col-span-1">
                    <label className="block mb-2 font-semibold text-gray-800 text-sm ">
                        {displayLabel} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <MultiImageUpload
                        isSingleMode={false}
                        onImagesChange={onChange}
                        initialImages={Array.isArray(value) ? value : []}
                        acceptedFormats={field.validation?.invalidType?.value ? 
                            field.validation.invalidType.value.split(',') : 
                            ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
                        }
                    />
                    {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
                </div>
            );

        default:
            return (
                <div className="col-span-1">
                    <label className="block mb-2 font-semibold text-gray-800 text-sm ">
                        {displayLabel} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <Input
                        id={field.id}
                        placeholder={field.placeholder || `Enter ${displayLabel.toLowerCase()}`}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        error={error}
                    />
                    {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
                </div>
            );
    }
}

export default DynamicFieldForm;
