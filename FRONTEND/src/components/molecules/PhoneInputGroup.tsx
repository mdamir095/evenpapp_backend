import React from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { Label } from '../atoms/Label';
import { FormHelperText } from '../atoms/FormHelperText';
import styles from './PhoneInputGroup.module.css';

interface PhoneInputGroupProps {
  label?: string;
  value?: string;
  onChange: (value: string | undefined) => void;
  error?: string;
  placeholder?: string;
  className?: string;
  id?: string;
  helperText?: string;
  required?: boolean;
}

export const PhoneInputGroup: React.FC<PhoneInputGroupProps> = ({
  label,
  value,
  onChange,
  error,
  placeholder = "Enter phone number",
  className = "",
  id,
  helperText,
  required = false,
}) => {
  const isError = Boolean(error);

  return (
    <div className="">
      {label && <Label htmlFor={id}>{label}</Label>}
      
      <div className="relative">
        <PhoneInput
          international
          countryCallingCodeEditable={false}
          defaultCountry="IN"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`border border-gray-300 rounded-md ${styles.phoneInputCustom} ${isError ? styles.phoneInputError : ''} ${className}`}
          style={{
            '--PhoneInputCountryFlag-height': '1em',
            '--PhoneInputCountrySelectArrow-width': '0.5em',
          } as React.CSSProperties}
        />
      </div>
      
      {/* Error message - matching Input component's error display */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      <FormHelperText>{helperText}</FormHelperText>
    </div>
  );
};

export default PhoneInputGroup;
