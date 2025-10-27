import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { InputGroup } from '../../../components/molecules/InputGroup';
import PhoneWithCountry, { type PhoneWithCountryValue } from '../../../components/molecules/PhoneWithCountry';
import type { EmployeeSchemaType } from '../schemas/employee.schema';
import { User, Mail } from 'lucide-react';

interface BasicDetailsTabProps {
  isEditMode: boolean;
}

export const BasicDetailsTab: React.FC<BasicDetailsTabProps> = ({
  isEditMode,
}) => {
  const methods = useFormContext<EmployeeSchemaType>();
  const { control } = methods;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900">
              Basic Employee Information
            </h3>
            <p className="text-sm text-blue-700">
              Enter the employee's personal and contact details
            </p>
          </div>
        </div>
      </div>

      {/* All Basic Information in One Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputGroup
            label="First Name"
            name="firstName"
            id="firstName"
            placeholder="Enter first name"
            autoComplete="given-name"
          />
          
          <InputGroup
            label="Last Name"
            name="lastName"
            id="lastName"
            placeholder="Enter last name"
            autoComplete="family-name"
          />
          
          <InputGroup
            label="Email Address"
            name="email"
            id="email"
            placeholder="Enter email address"
            autoComplete="email"
            disabled={isEditMode}
          />

          <InputGroup
              label="Organization Name"
              name="organizationName"
              id="organizationName"
              placeholder="Enter organization name"
              autoComplete="organization"
            />
          
          <Controller
            name="phoneNumber"
            control={control}
            render={({ field, fieldState }) => {
              const currentCountryCode = methods.watch('countryCode');
              
              const phoneValue: PhoneWithCountryValue = {
                countryCode: currentCountryCode || '',
                phoneNumber: field.value || '',
                dialCode: ''
              };

              const handlePhoneChange = (phoneData: PhoneWithCountryValue) => {
                field.onChange(phoneData.phoneNumber);
                methods.setValue('countryCode', phoneData.dialCode);
              };

              return (
                <PhoneWithCountry
                  label="Phone Number"
                  value={phoneValue}
                  onChange={handlePhoneChange}
                  error={fieldState.error?.message}
                  placeholder="Enter phone number"
                  id="phoneNumber"
                  required
                />
              );
            }}
          />

          <InputGroup
            label="Street Address"
            name="address"
            id="address"
            placeholder="Enter full street address"
            autoComplete="street-address"
          />
          
          <InputGroup
            label="City"
            name="city"
            id="city"
            placeholder="Enter city"
            autoComplete="address-level2"
          />
          
          <InputGroup
            label="State/Province"
            name="state"
            id="state"
            placeholder="Enter state or province"
            autoComplete="address-level1"
          />
          
          <InputGroup
            label="Postal Code"
            name="pincode"
            id="pincode"
            placeholder="Enter postal/ZIP code"
            autoComplete="postal-code"
          />
          
          {/* Empty placeholder to maintain 2-column layout */}
          <div></div>
        </div>
      </div>

      {/* Information Note */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 text-blue-500 mt-0.5">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-800 mb-1">Next Step</h4>
            <p className="text-sm text-gray-600">
              After completing the basic details, proceed to the next tab to configure feature permissions and enterprise settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicDetailsTab;
