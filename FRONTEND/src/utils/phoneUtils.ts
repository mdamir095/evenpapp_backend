/**
 * Phone Number Utilities
 * 
 * Helper functions to detect country code from phone numbers
 * and handle phone number formatting
 */

interface CountryPhoneMapping {
  code: string;
  dialCode: string;
  patterns: RegExp[];
}

// Common country phone number patterns
const COUNTRY_PHONE_PATTERNS: CountryPhoneMapping[] = [
  {
    code: 'IN',
    dialCode: '+91',
    patterns: [
      /^91\d{10}$/,     // 919876543210
      /^(\+91|0091)\d{10}$/, // +919876543210 or 00919876543210
      /^\d{10}$/        // 9876543210 (Indian mobile without country code)
    ]
  },
  {
    code: 'US',
    dialCode: '+1',
    patterns: [
      /^1\d{10}$/,      // 15551234567
      /^(\+1|001)\d{10}$/, // +15551234567
      /^\d{10}$/        // Could be US number without country code
    ]
  },
  {
    code: 'GB',
    dialCode: '+44',
    patterns: [
      /^44\d{10}$/,     // 447700123456
      /^(\+44|0044)\d{10}$/, // +447700123456
    ]
  },
  {
    code: 'CA',
    dialCode: '+1',
    patterns: [
      /^1\d{10}$/,      // Same as US
      /^(\+1|001)\d{10}$/,
    ]
  },
  {
    code: 'AU',
    dialCode: '+61',
    patterns: [
      /^61\d{9}$/,      // 61412345678
      /^(\+61|0061)\d{9}$/, // +61412345678
    ]
  }
];

/**
 * Detect country code from phone number
 * @param phoneNumber - Phone number string
 * @returns Detected country code or 'IN' as default
 */
export const detectCountryFromPhone = (phoneNumber: string): string => {
  if (!phoneNumber) {
    return 'IN'; // Default to India
  }

  // Clean phone number (remove spaces, dashes, etc.)
  const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');

  // Check against country patterns
  for (const country of COUNTRY_PHONE_PATTERNS) {
    for (const pattern of country.patterns) {
      if (pattern.test(cleanPhone)) {
        // Special case: if it's a 10-digit number, assume it's Indian
        if (cleanPhone.length === 10) {
          return 'IN';
        }
        return country.code;
      }
    }
  }

  // If no pattern matches, try to detect by length and common prefixes
  if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
    return 'IN';
  }
  if (cleanPhone.startsWith('1') && cleanPhone.length === 11) {
    return 'US';
  }
  if (cleanPhone.startsWith('44') && cleanPhone.length === 12) {
    return 'GB';
  }
  if (cleanPhone.startsWith('61') && cleanPhone.length === 11) {
    return 'AU';
  }

  // Default to India for any unrecognized pattern
  return 'IN';
};

/**
 * Format phone number for display
 * @param phoneNumber - Phone number string
 * @param countryCode - Country code
 * @returns Formatted phone number
 */
export const formatPhoneForDisplay = (phoneNumber: string, countryCode: string): string => {
  if (!phoneNumber) return '';
  
  const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  // If phone already includes country code, return as is
  if (cleanPhone.length > 10) {
    return cleanPhone;
  }
  
  // Add country code if missing
  const country = COUNTRY_PHONE_PATTERNS.find(c => c.code === countryCode);
  if (country) {
    const dialCode = country.dialCode.replace('+', '');
    return `${dialCode}${cleanPhone}`;
  }
  
  return cleanPhone;
};

/**
 * Get dial code from country code
 * @param countryCode - Country code (e.g., 'IN', 'US')
 * @returns Dial code (e.g., '+91', '+1')
 */
export const getDialCodeFromCountry = (countryCode: string): string => {
  const country = COUNTRY_PHONE_PATTERNS.find(c => c.code === countryCode);
  return country ? country.dialCode : '+91';
};

/**
 * Validate phone number format
 * @param phoneNumber - Phone number string
 * @returns Boolean indicating if phone number is valid
 */
export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  if (!phoneNumber) return false;
  
  const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  // Check if it matches any known pattern
  return COUNTRY_PHONE_PATTERNS.some(country =>
    country.patterns.some(pattern => pattern.test(cleanPhone))
  );
};
