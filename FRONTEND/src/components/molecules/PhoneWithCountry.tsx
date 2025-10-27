import React from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Label } from '../atoms/Label';
import { FormHelperText } from '../atoms/FormHelperText';

/**
 * Phone With Country Component
 * 
 * Features:
 * - Country code and phone number in same input
 * - Search functionality for countries
 * - Returns both country code and phone number
 * - Flag display for selected country
 * - Consistent styling with form inputs
 * - Built on react-phone-input-2 library
 */

export interface PhoneWithCountryValue {
  countryCode: string; // Country code (e.g., "91", "1", "44")
  phoneNumber: string; // Full phone number with country code (e.g., "919876543210")
  dialCode: string;    // Dial code (e.g., "+91", "+1", "+44")
}

interface PhoneWithCountryProps {
  label?: string;
  value?: PhoneWithCountryValue | string; // Can accept full phone number string or object
  onChange: (phoneData: PhoneWithCountryValue) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
}

const PhoneWithCountry: React.FC<PhoneWithCountryProps> = ({
  label = "Phone Number",
  value,
  onChange,
  error,
  placeholder = "Enter phone number",
  required = false,
  disabled = false,
  id = "phone-with-country",
  className = ""
}) => {
  // Parse value to get phone number string
  const phoneValue = React.useMemo(() => {
    if (typeof value === 'string') {
      return value;
    }
    if (value && typeof value === 'object' && value.phoneNumber) {
      return value.phoneNumber;
    }
    return '';
  }, [value]);

  // Get country from countryCode if available
  const defaultCountry = React.useMemo(() => {
    if (value && typeof value === 'object' && value.countryCode && typeof value.countryCode === 'string') {
      // Handle both dial code (+91) and country code (IN)
      if (value.countryCode.startsWith('+')) {
        // It's a dial code, convert to country code
        const dialCodeMap: Record<string, string> = {
          '+91': 'in',
          '+1': 'us',
          '+44': 'gb',
          '+61': 'au',
          '+81': 'jp',
          '+49': 'de',
          '+33': 'fr',
          '+86': 'cn'
        };
        return dialCodeMap[value.countryCode] || 'in';
      } else {
        // It's a country code, convert to lowercase
        return value.countryCode.toLowerCase();
      }
    }
    return 'in'; // Default to India
  }, [value]);



  // Handle phone input change
  const handlePhoneChange = (phone: string, countryData: any) => {
    const phoneData: PhoneWithCountryValue = {
      countryCode: countryData.countryCode?.toUpperCase() || '',
      phoneNumber: phone,
      dialCode: `+${countryData.dialCode}` || '+1'
    };
    
    onChange(phoneData);
  };

  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      {label && (
        <Label 
          htmlFor={id}
          required={required}
        >
          {label}
        </Label>
      )}
      
      <div className="relative">
        <PhoneInput
          country={defaultCountry} // Use dynamic country based on countryCode
          value={phoneValue}
          onChange={handlePhoneChange}
          disabled={disabled}
          placeholder={placeholder}
          enableSearch={true} // Enable country search
          searchPlaceholder="Search countries..."
          preferredCountries={['in', 'us', 'gb', 'ca', 'au']} // Priority countries
          inputProps={{
            id: id,
            required: required,
            'aria-invalid': !!error,
            'aria-describedby': error ? `${id}-error` : undefined
          }}
          inputStyle={{
            width: '100%',
            height: '33px',
            fontSize: '14px',
            border: error ? '2px solid #ef4444' : '1px solid #d1d5db',
            borderRadius: '6px',
            paddingLeft: '48px',
            backgroundColor: disabled ? '#f9fafb' : 'white',
            color: disabled ? '#6b7280' : '#374151',
          }}
          buttonStyle={{
            border: error ? '2px solid #ef4444' : '1px solid #d1d5db',
            borderRight: 'none',
            borderRadius: '8px 0 0 8px',
            backgroundColor: disabled ? '#f9fafb' : 'white',
            padding: '0 8px',
          }}
          dropdownStyle={{
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            zIndex: 9999,
          }}
          searchStyle={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px',
            margin: '8px',
            // width: 'calc(100% - 16px)',
          }}
          containerStyle={{
            width: '100%',
          }}
          inputClass={error ? 'phone-input-error' : 'phone-input-normal'}
        />
      </div>
      
      {error && (
        <FormHelperText error id={`${id}-error`}>
          {error}
        </FormHelperText>
      )}

      {/* Custom CSS for additional styling */}
      <style jsx>{`
        :global(.phone-input-normal:focus) {
          outline: none !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }
        
        :global(.phone-input-error:focus) {
          outline: none !important;
          border-color: #ef4444 !important;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
        }
        
        :global(.react-tel-input .flag-dropdown) {
          border-color: ${error ? '#ef4444' : '#d1d5db'} !important;
        }
        
        :global(.react-tel-input .flag-dropdown:hover) {
          border-color: ${error ? '#ef4444' : '#9ca3af'} !important;
        }
        
        :global(.react-tel-input .selected-flag:hover) {
          background-color: ${disabled ? '#f9fafb' : '#f3f4f6'} !important;
        }
        
        :global(.react-tel-input .country-list .country:hover) {
          background-color: #eff6ff !important;
        }
        
        :global(.react-tel-input .country-list .country.highlight) {
          background-color: #3b82f6 !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
};

export default PhoneWithCountry;
