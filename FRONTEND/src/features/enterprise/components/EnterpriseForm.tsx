import React, { useEffect, useState } from 'react';
import { enterpriseSchema } from '../schemas/enterprise.schema';
import type { EnterpriseSchemaType } from '../schemas/enterprise.schema';
import { Form } from '../../../components/common/Form';
import { InputGroup } from '../../../components/molecules/InputGroup';
import { Button } from '../../../components/atoms/Button';
import { FormError } from '../../../components/atoms/FormError';
import { useEnterpriseActions } from '../hooks/useEnterpriseActions';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../../layouts/Layout';
import { useEnterprise } from '../hooks/useEnterprise';
import { useToast } from '../../../components/atoms/Toast';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PhoneWithCountry, { type PhoneWithCountryValue } from '../../../components/molecules/PhoneWithCountry';
import type { EnterpriseFeature } from '../../../types/Enterprise';
import { FeaturePermissionTable } from '../../../components/common/FeaturePermissionTable';
import { detectCountryFromPhone } from '../../../utils/phoneUtils';
import { ChevronDown, ChevronUp } from 'lucide-react';

const EnterpriseForm: React.FC = () => {
  const { loading, error, selectedEnterprise, features } = useEnterprise();
  const { addEnterprise, fetchEnterpriseById, updateEnterprise, fetchFeatures } = useEnterpriseActions();
  const { id } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  
  // Track expand/collapse state for feature permissions
  const [isFeatureExpanded, setIsFeatureExpanded] = useState(false);

  const methods = useForm<EnterpriseSchemaType>({
    resolver: zodResolver(enterpriseSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      countryCode: '+91', // ✅ Default to India dial code
      phoneNumber: '',
      enterpriseName: '',
      description: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      features: [],
    },
  });

  const { control, reset } = methods;

  useEffect(() => {
    fetchFeatures();
    if (id) fetchEnterpriseById(id);
  }, [id]);

  useEffect(() => {
    if (id && selectedEnterprise) {
      // Handle dial code vs country code
      let defaultCountryCode = selectedEnterprise.countryCode || '';
      
      // If countryCode looks like dial code (+91), use it directly
      if (typeof defaultCountryCode === 'string' && defaultCountryCode.startsWith('+')) {
        // Already a dial code, use as is
      } else if (defaultCountryCode === 'IN') {
        // Convert country code to dial code
        defaultCountryCode = '+91';
      } else {
        // Try to detect from phone number
        const detectedCountry = detectCountryFromPhone(selectedEnterprise.phoneNumber || '');
        defaultCountryCode = detectedCountry === 'IN' ? '+91' : '+1'; // Default fallback
      }
      
      // Format phone number - if it's Indian number without country code, add it
      let formattedPhoneNumber = selectedEnterprise.phoneNumber || '';
      if (formattedPhoneNumber && formattedPhoneNumber.length === 10 && (defaultCountryCode === '+91' || defaultCountryCode === 'IN')) {
        formattedPhoneNumber = `91${formattedPhoneNumber}`;
      }

      reset({
        firstName: selectedEnterprise.firstName || '',
        lastName: selectedEnterprise.lastName || '',
        email: selectedEnterprise.email || '',
        countryCode: defaultCountryCode,
        phoneNumber: formattedPhoneNumber,
        enterpriseName: selectedEnterprise.enterpriseName || '',
        description: selectedEnterprise.description || '',
        address: selectedEnterprise.address || '',
        city: selectedEnterprise.city || '',
        state: selectedEnterprise.state || '',
        pincode: selectedEnterprise.pincode || '',
        features: selectedEnterprise.features?.map((f: EnterpriseFeature) => ({
          featureId: f.featureId,
          permissions: {
            read: f.permissions?.read ?? false,
            write: f.permissions?.write ?? false,
            admin: f.permissions?.admin ?? false,
          },
        })) || [],
      });
    } else if (!id && features?.length) {
      reset((prev) => ({
        ...prev,
        features: features.map((f) => ({
          featureId: f.id,
          permissions: { read: false, write: false, admin: false },
        })),
      }));
    }
  }, [id, selectedEnterprise, features, reset]);

  const onSubmit = async (data: EnterpriseSchemaType) => {
    try {
      if (id) {
        await updateEnterprise(id, data);
        toast.success('Enterprise updated successfully');
      } else {
        await addEnterprise(data);
        toast.success('Enterprise created successfully');
      }
      navigate('/enterprise-management');
    } catch (error) {
      // The error is already handled by Redux actions and will be displayed via the error state
      // No need to show a toast here as the FormError component will display the specific error
    }
  };

  return (
    <Layout>
      <></>
      <h2 className="text-xl font-semibold mb-2">{id ? 'Edit Enterprise' : 'Create Enterprise'}</h2>
      {/* <Breadcrumbs /> */}
      <FormProvider {...methods}>
        <Form<EnterpriseSchemaType>
          mode="all"
          schema={enterpriseSchema}
          onSubmit={onSubmit}
          className="min-w-full px-0 py-0 grid grid-cols-1 gap-8 items-start "
          >
          <div className="p-6 bg-white text-gray-800 shadow-sm mt-5   border border-neutral-100 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-800">Customer</h2>
            <p className="text-sm text-gray-500 mb-6">
              Please fill in the enterprise details and select feature permissions.
            </p>
      
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup
                label="First Name"
                name="firstName"
                id="firstName"
                placeholder="Enter your first name"
                autoComplete="description"
              />
              <InputGroup
                label="Last Name"
                name="lastName"
                id="lastName"
                placeholder="Enter your last name"
                autoComplete="description"
              />
              <InputGroup
                label="Email"
                name="email"
                id="email"
                placeholder="Enter your email"
                autoComplete="description"
              />
              {/* Phone Number with Country Code */}
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field, fieldState }) => {
                  // Watch countryCode to ensure reactive updates
                  const currentCountryCode = methods.watch('countryCode');
                  
                  // Create phone value from form data
                  const phoneValue: PhoneWithCountryValue = {
                    countryCode: currentCountryCode || '',
                    phoneNumber: field.value || '',
                    dialCode: ''
                  };

                  const handlePhoneChange = (phoneData: PhoneWithCountryValue) => {
                    // Update both phoneNumber and countryCode fields
                    field.onChange(phoneData.phoneNumber);
                    // ✅ Store dialCode (+91) instead of countryCode (IN)
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
                label="Enterprise Name"
                name="enterpriseName"
                id="enterpriseName"
                placeholder="Enter your enterprise name"
                autoComplete="description"
              />
              <InputGroup
                label="Description"
                name="description"
                id="description"
                placeholder="Enter your description"
                autoComplete="description"
              />
              <InputGroup
                label="Address"
                name="address"
                id="address"
                placeholder="Enter your address"
                autoComplete="description"
              />
              <InputGroup
                label="City"
                name="city"
                id="city"
                placeholder="Enter your city"
                autoComplete="description"
              />
              <InputGroup
                label="State"
                name="state"
                id="state"
                placeholder="Enter your state"
                autoComplete="description"
              />
              <InputGroup
                label="Pincode"
                name="pincode"
                id="pincode"
                placeholder="Enter your pincode"
                autoComplete="description"
              />
            </div>

            {/* Feature Permissions Section with Expand/Collapse */}
            <div className="mt-8 col-span-2 bg-gray-100">
              <div 
                className='flex justify-between items-center mb-4 cursor-pointer bg-gray-100 p-3 rounded-lg hover:bg-gray-100 transition-colors'
                onClick={() => setIsFeatureExpanded(!isFeatureExpanded)}
              >  
                <h3 className="font-semibold text-lg mb-0 text-gray-800">Feature Permissions</h3>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-sm">{isFeatureExpanded ? 'Collapse' : 'Expand'}</span>
                  {isFeatureExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>
              
              {isFeatureExpanded && (
                <div className="transition-all duration-300 ease-in-out">
                  <FeaturePermissionTable features={features} name="features" />
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="col-span-2 flex space-x-4 pt-6 flex-col mt-6 ">
              <FormError message={error ?? undefined} className="mb-6" />
              <div className="grid grid-cols-2 gap-4  mr-auto">
                <Button variant="primary" size="sm" disabled={loading}>
                  {loading ? 'Saving...' : id ? 'Update Enterprise' : 'Create Enterprise'}
                </Button>
                <Button
                  variant="muted"
                  size="sm"
                  type="button"
                  onClick={() => navigate('/enterprise-management')}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Form>
      </FormProvider>
    </Layout>
  );
};

export default EnterpriseForm;
