import React from 'react';
import { Radio} from '../atoms/Radio';
import { Label } from '../atoms/Label';

export type RadioOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type RadioGroupProps = {
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
};

export const RadioGroup: React.FC<RadioGroupProps> = ({ name, options, value, onChange, label }) => (
  <div className="mb-4">
    {label && <Label>{label}</Label>}
    <div className="flex flex-col gap-2">
      {options.map(option => (
        <label key={option.value} className="flex items-center gap-2">
          <Radio
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            disabled={option.disabled}
          />
          {option.label}
        </label>
      ))}
    </div>
  </div>
);
