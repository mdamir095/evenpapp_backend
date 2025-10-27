import React from 'react';
import Select, { type StylesConfig, type SingleValue } from 'react-select';
import { Label } from '../atoms/Label';
import { FormHelperText } from '../atoms/FormHelperText';

// Simple country data instead of external library
const COUNTRIES = {
  'IN': 'India',
  'US': 'United States', 
  'GB': 'United Kingdom',
  'CA': 'Canada',
  'AU': 'Australia',
  'DE': 'Germany',
  'FR': 'France',
  'JP': 'Japan',
  'CN': 'China',
  'BR': 'Brazil'
};

/**
 * Country Code Selector Component
 * 
 * Features:
 * - Search functionality with country names
 * - Displays country flag, name, and code
 * - Returns country code for API payload
 * - Consistent styling with other form inputs
 * - Accessible and keyboard navigable
 */

export interface CountryOption {
  value: string; // Country code (e.g., "US", "IN", "UK")
  label: string; // Display format (e.g., "🇺🇸 United States (+1)")
  name: string;  // Country name (e.g., "United States")
  code: string;  // Country code (e.g., "US")
  dialCode: string; // Phone dial code (e.g., "+1")
  flag: string;  // Flag emoji (e.g., "🇺🇸")
}

interface CountryCodeSelectorProps {
  label?: string;
  value?: string; // Country code value
  onChange: (countryCode: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
}

// Country dial codes mapping
const COUNTRY_DIAL_CODES: Record<string, string> = {
  'AD': '+376', 'AE': '+971', 'AF': '+93', 'AG': '+1', 'AI': '+1',
  'AL': '+355', 'AM': '+374', 'AO': '+244', 'AR': '+54', 'AS': '+1',
  'AT': '+43', 'AU': '+61', 'AW': '+297', 'AX': '+358', 'AZ': '+994',
  'BA': '+387', 'BB': '+1', 'BD': '+880', 'BE': '+32', 'BF': '+226',
  'BG': '+359', 'BH': '+973', 'BI': '+257', 'BJ': '+229', 'BL': '+590',
  'BM': '+1', 'BN': '+673', 'BO': '+591', 'BQ': '+599', 'BR': '+55',
  'BS': '+1', 'BT': '+975', 'BW': '+267', 'BY': '+375', 'BZ': '+501',
  'CA': '+1', 'CC': '+61', 'CD': '+243', 'CF': '+236', 'CG': '+242',
  'CH': '+41', 'CI': '+225', 'CK': '+682', 'CL': '+56', 'CM': '+237',
  'CN': '+86', 'CO': '+57', 'CR': '+506', 'CU': '+53', 'CV': '+238',
  'CW': '+599', 'CX': '+61', 'CY': '+357', 'CZ': '+420', 'DE': '+49',
  'DJ': '+253', 'DK': '+45', 'DM': '+1', 'DO': '+1', 'DZ': '+213',
  'EC': '+593', 'EE': '+372', 'EG': '+20', 'EH': '+212', 'ER': '+291',
  'ES': '+34', 'ET': '+251', 'FI': '+358', 'FJ': '+679', 'FK': '+500',
  'FM': '+691', 'FO': '+298', 'FR': '+33', 'GA': '+241', 'GB': '+44',
  'GD': '+1', 'GE': '+995', 'GF': '+594', 'GG': '+44', 'GH': '+233',
  'GI': '+350', 'GL': '+299', 'GM': '+220', 'GN': '+224', 'GP': '+590',
  'GQ': '+240', 'GR': '+30', 'GT': '+502', 'GU': '+1', 'GW': '+245',
  'GY': '+592', 'HK': '+852', 'HN': '+504', 'HR': '+385', 'HT': '+509',
  'HU': '+36', 'ID': '+62', 'IE': '+353', 'IL': '+972', 'IM': '+44',
  'IN': '+91', 'IO': '+246', 'IQ': '+964', 'IR': '+98', 'IS': '+354',
  'IT': '+39', 'JE': '+44', 'JM': '+1', 'JO': '+962', 'JP': '+81',
  'KE': '+254', 'KG': '+996', 'KH': '+855', 'KI': '+686', 'KM': '+269',
  'KN': '+1', 'KP': '+850', 'KR': '+82', 'KW': '+965', 'KY': '+1',
  'KZ': '+7', 'LA': '+856', 'LB': '+961', 'LC': '+1', 'LI': '+423',
  'LK': '+94', 'LR': '+231', 'LS': '+266', 'LT': '+370', 'LU': '+352',
  'LV': '+371', 'LY': '+218', 'MA': '+212', 'MC': '+377', 'MD': '+373',
  'ME': '+382', 'MF': '+590', 'MG': '+261', 'MH': '+692', 'MK': '+389',
  'ML': '+223', 'MM': '+95', 'MN': '+976', 'MO': '+853', 'MP': '+1',
  'MQ': '+596', 'MR': '+222', 'MS': '+1', 'MT': '+356', 'MU': '+230',
  'MV': '+960', 'MW': '+265', 'MX': '+52', 'MY': '+60', 'MZ': '+258',
  'NA': '+264', 'NC': '+687', 'NE': '+227', 'NF': '+672', 'NG': '+234',
  'NI': '+505', 'NL': '+31', 'NO': '+47', 'NP': '+977', 'NR': '+674',
  'NU': '+683', 'NZ': '+64', 'OM': '+968', 'PA': '+507', 'PE': '+51',
  'PF': '+689', 'PG': '+675', 'PH': '+63', 'PK': '+92', 'PL': '+48',
  'PM': '+508', 'PN': '+64', 'PR': '+1', 'PS': '+970', 'PT': '+351',
  'PW': '+680', 'PY': '+595', 'QA': '+974', 'RE': '+262', 'RO': '+40',
  'RS': '+381', 'RU': '+7', 'RW': '+250', 'SA': '+966', 'SB': '+677',
  'SC': '+248', 'SD': '+249', 'SE': '+46', 'SG': '+65', 'SH': '+290',
  'SI': '+386', 'SJ': '+47', 'SK': '+421', 'SL': '+232', 'SM': '+378',
  'SN': '+221', 'SO': '+252', 'SR': '+597', 'SS': '+211', 'ST': '+239',
  'SV': '+503', 'SX': '+1', 'SY': '+963', 'SZ': '+268', 'TC': '+1',
  'TD': '+235', 'TF': '+262', 'TG': '+228', 'TH': '+66', 'TJ': '+992',
  'TK': '+690', 'TL': '+670', 'TM': '+993', 'TN': '+216', 'TO': '+676',
  'TR': '+90', 'TT': '+1', 'TV': '+688', 'TW': '+886', 'TZ': '+255',
  'UA': '+380', 'UG': '+256', 'US': '+1', 'UY': '+598', 'UZ': '+998',
  'VA': '+39', 'VC': '+1', 'VE': '+58', 'VG': '+1', 'VI': '+1',
  'VN': '+84', 'VU': '+678', 'WF': '+681', 'WS': '+685', 'YE': '+967',
  'YT': '+262', 'ZA': '+27', 'ZM': '+260', 'ZW': '+263'
};

// Flag emoji mapping (simplified version)
const FLAG_EMOJIS: Record<string, string> = {
  'US': '🇺🇸', 'IN': '🇮🇳', 'GB': '🇬🇧', 'CA': '🇨🇦', 'AU': '🇦🇺',
  'DE': '🇩🇪', 'FR': '🇫🇷', 'JP': '🇯🇵', 'CN': '🇨🇳', 'BR': '🇧🇷',
  'IT': '🇮🇹', 'ES': '🇪🇸', 'KR': '🇰🇷', 'MX': '🇲🇽', 'RU': '🇷🇺',
  'NL': '🇳🇱', 'SE': '🇸🇪', 'CH': '🇨🇭', 'SG': '🇸🇬', 'AE': '🇦🇪'
};

const CountryCodeSelector: React.FC<CountryCodeSelectorProps> = ({
  label = "Country",
  value,
  onChange,
  error,
  placeholder = "Select country...",
  required = false,
  disabled = false,
  id = "country-code-selector",
  className = ""
}) => {
  // Generate country options
  const countryOptions: CountryOption[] = React.useMemo(() => {
    return Object.entries(COUNTRIES).map(([code, name]) => {
      const dialCode = COUNTRY_DIAL_CODES[code] || '+1';
      const flag = FLAG_EMOJIS[code] || '🌍';
      
      return {
        value: code,
        label: `${flag} ${name} (${dialCode})`,
        name,
        code,
        dialCode,
        flag
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Find selected option
  const selectedOption = countryOptions.find(option => option.value === value) || null;

  // Handle selection change
  const handleChange = (selectedOption: SingleValue<CountryOption>) => {
    onChange(selectedOption?.value || '');
  };

  // Custom styles for react-select to match existing form styling
  const customStyles: StylesConfig<CountryOption, false> = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '40px',
      border: error 
        ? '1px solid #ef4444' 
        : state.isFocused 
          ? '1px solid #3b82f6'
          : '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      boxShadow: state.isFocused 
        ? '0 0 0 3px rgba(59, 130, 246, 0.1)' 
        : 'none',
      '&:hover': {
        borderColor: error ? '#ef4444' : '#9ca3af',
      },
      backgroundColor: disabled ? '#f9fafb' : 'white',
      cursor: disabled ? 'not-allowed' : 'pointer'
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? '#3b82f6' 
        : state.isFocused 
          ? '#eff6ff' 
          : 'white',
      color: state.isSelected ? 'white' : '#374151',
      fontSize: '14px',
      padding: '8px 12px',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: state.isSelected ? '#3b82f6' : '#eff6ff'
      }
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#9ca3af',
      fontSize: '14px'
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#374151',
      fontSize: '14px'
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: '#9ca3af',
      '&:hover': {
        color: '#6b7280'
      }
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      backgroundColor: '#d1d5db'
    }),
    input: (provided) => ({
      ...provided,
      color: '#374151',
      fontSize: '14px'
    })
  };

  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      {label && (
        <Label htmlFor={id}>
          {label}
        </Label>
      )}
      
      <Select<CountryOption>
        id={id}
        value={selectedOption}
        onChange={handleChange}
        options={countryOptions}
        styles={customStyles}
        placeholder={placeholder}
        isDisabled={disabled}
        isSearchable={true}
        isClearable={true}
        menuPosition="fixed"
        menuShouldScrollIntoView={false}
        filterOption={(option, inputValue) => {
          // Search by country name or dial code
          const searchValue = inputValue.toLowerCase();
          return (
            option.data.name.toLowerCase().includes(searchValue) ||
            option.data.dialCode.includes(searchValue) ||
            option.data.code.toLowerCase().includes(searchValue)
          );
        }}
        formatOptionLabel={(option) => (
          <div className="flex items-center space-x-2">
            <span className="text-lg">{option.flag}</span>
            <span className="flex-1">{option.name}</span>
            <span className="text-gray-500 text-sm">{option.dialCode}</span>
          </div>
        )}
        noOptionsMessage={({ inputValue }) => 
          inputValue ? `No countries found for "${inputValue}"` : 'No countries available'
        }
      />
      
      {error && <FormHelperText>{error}</FormHelperText>}
    </div>
  );
};

export default CountryCodeSelector;
