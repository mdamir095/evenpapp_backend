import React, { useEffect, useState } from 'react';
import { userSchema } from '../schemas/user.schema';
import type { UserSchemaType } from '../schemas/user.schema';
import { Form } from '../../../components/common/Form';
import { InputGroup } from '../../../components/molecules/InputGroup';
import { Button } from '../../../components/atoms/Button';
import { FormError } from '../../../components/atoms/FormError';
import { useUserActions } from '../hooks/useUserActions';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../../layouts/Layout';
import { useUser } from '../hooks/useUser';
import { CheckboxWithLabel } from '../../../components/molecules/CheckboxWithLabel';
import { useToast } from '../../../components/atoms/Toast';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Breadcrumbs from '../../../components/common/BreadCrumb';
import PhoneWithCountry, { type PhoneWithCountryValue } from '../../../components/molecules/PhoneWithCountry';
import { detectCountryFromPhone } from '../../../utils/phoneUtils';
import { FeaturePermissionTable } from '../../../components/common/FeaturePermissionTable';
import { ChevronDown, ChevronUp } from 'lucide-react';

type UserFormValues = UserSchemaType;

const UserForm: React.FC = () => {
  const userData = useUser();
  const { loading, formLoading, error, selectedUser, features = [] } = userData || {};
  const { addUser, fetchUserById, updateUser, fetchFeatures } = useUserActions();
  const { id } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  
  // Track if features have been loaded
  const [featuresLoaded, setFeaturesLoaded] = useState(false);
  
  // Track expand/collapse state for feature permissions
  const [isFeatureExpanded, setIsFeatureExpanded] = useState(false);
  // Load features and user details
  useEffect(() => {
    fetchFeatures();
    if (id) {
      fetchUserById(id);
    }
  }, [id]);
  // Set default values
  const methods = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      organizationName: '',
      countryCode: '+91', // ✅ Default to India dial code
      phoneNumber: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      isActive: false,
      isEmailVerified: false,
      features: [], // ✅ Changed from roleIds to features
    },
  });

  

  // Track when features are loaded
  useEffect(() => {
    if (features && Array.isArray(features)) {
      setFeaturesLoaded(true);
    }
  }, [features, loading]);

  // Fallback timeout - if loading takes too long, show error
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!featuresLoaded && !loading) {
        setFeaturesLoaded(true);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [featuresLoaded, loading]);

  const {control, reset } = methods;

   // user form when selectedUser is fetched
   useEffect(() => {
    if (id && selectedUser) {
      let defaultCountryCode = selectedUser.countryCode || '';
      
      if (typeof defaultCountryCode === 'string' && defaultCountryCode.startsWith('+')) {
        // Already a dial code, use as is
      } else if (defaultCountryCode === 'IN') {
        // Convert country code to dial code
        defaultCountryCode = '+91';
      } else {
        // Try to detect from phone number
        const detectedCountry = detectCountryFromPhone(selectedUser.phoneNumber || '');
        defaultCountryCode = detectedCountry === 'IN' ? '+91' : '+1'; // Default fallback
      }
      
      // Format phone number - if it's Indian number without country code, add it
      let formattedPhoneNumber = selectedUser.phoneNumber || '';
      if (formattedPhoneNumber && formattedPhoneNumber.length === 10 && (defaultCountryCode === '+91' || defaultCountryCode === 'IN')) {
        formattedPhoneNumber = `91${formattedPhoneNumber}`;
      }
      
      const resetData = {
        firstName: selectedUser.firstName || '',
        lastName: selectedUser.lastName || '',
        email: selectedUser.email || '',
        organizationName: selectedUser.organizationName || '',
        countryCode: defaultCountryCode,
        phoneNumber: formattedPhoneNumber,
        description: selectedUser.description || '', // API might not have this field
        address: selectedUser.address || '',
        city: selectedUser.city || '', 
        state: selectedUser.state || '',
        pincode: selectedUser.pincode || '',
        isActive: selectedUser.isActive !== undefined ? selectedUser.isActive : false,
        isEmailVerified: selectedUser.isEmailVerified !== undefined ? selectedUser.isEmailVerified : false,
        features: selectedUser.features?.map((f: any) => ({
          featureId: f.featureId,
          permissions: {
            read: f.permissions?.read ?? false,
            write: f.permissions?.write ?? false,
            admin: f.permissions?.admin ?? false,
          },
        })) || [],
      };

      reset(resetData);
    }
  }, [selectedUser, reset]);

  // Initialize features for create mode - only after features are loaded
  useEffect(() => {
    if (!id && featuresLoaded && features && Array.isArray(features) && features.length > 0) {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        organizationName: '',
        countryCode: '+91',
        phoneNumber: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        isActive: false,
        isEmailVerified: false,
        features: (features || []).map((feature: any) => ({
          featureId: feature.id,
          permissions: { write: false, read: false, admin: false },
        })),
      });
    }
  }, [features, featuresLoaded, id, reset]);

  const onSubmit = async (
    data: UserFormValues,
  ) => {
    try {
      if(id) {
        await updateUser(id, data.firstName, data.lastName, data.email, data.organizationName, data.countryCode, data.phoneNumber, data.isActive || false, data.isEmailVerified || false, data.features);
        toast.success('User updated successfully');
        navigate('/user-management');
      } else {
        await addUser(data.firstName, data.lastName, data.email, data.organizationName, data.countryCode, data.phoneNumber, data.isActive || false, data.isEmailVerified || false, data.features);
        toast.success('User created successfully');
        navigate('/user-management'); 
      }
    } catch (error: any) {
      // Display error via toast as fallback
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.message || 
                          'Something went wrong';
      toast.error(errorMessage);
    }
  };
  
  useEffect(() => {
    if (id) {
      fetchUserById(id); 
    }
  }, [id, fetchUserById]);

  return (
    <Layout>
      <h2 className="text-xl font-semibold mb-2">{id ? 'Edit User' : 'Create User'}</h2>
       <Breadcrumbs/>
       <div className="text-gray-800 shadow-sm mt-5 max-w-3xl border  border-neutral-100 bg-white  rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-800">Customer</h2>
        <p className="text-sm text-gray-500 mb-6">
          Lorem ipsum dolor sit amet consectetur. Non ac nulla aliquam aenean in velit mattis.
        </p>
        <FormProvider {...methods}>
          <Form<UserFormValues>
            mode="all"
            schema={userSchema}
            onSubmit={onSubmit}
          className='bg-white  min-w-full px-0 py-0'
        >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-4">
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
          <InputGroup
            label="Organization Name"
            name="organizationName"
            id="organizationName"
            placeholder="Enter your organization name"
            autoComplete="description"
          />
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
          <InputGroup
            label="Password"
            name="password"
            id="password"
            placeholder="Enter your password"
            autoComplete="description"
          />     
          {/* Feature Permissions Section with Expand/Collapse */}
          <div className="col-span-2 mt-6">
            <div 
              className='flex justify-between items-center mb-4 cursor-pointer bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors'
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
        </div>

        <div className="flex space-x-4 pt-4 flex-col ml-auto mt-4">
          <FormError message={error ?? undefined}  className='mb-6'/>
          <div className="grid grid-cols-2 gap-4 m-auto">
            <Button 
              variant="primary" 
              size="sm" 
              disabled={formLoading || !featuresLoaded} 
              className='w-full'
            >
              {formLoading ? 'Saving...' : !featuresLoaded ? 'Loading Features...' : id ? 'Update User' : 'Create User'}
            </Button>
            <Button
              variant="default"
              size="sm" className='w-full'
              type="button"
              onClick={() => navigate('/user-management')}
            >
              Cancel
            </Button>
          </div>
        </div>
          </Form>
        </FormProvider>
      </div>
    </Layout>
  );
};

export default UserForm;
