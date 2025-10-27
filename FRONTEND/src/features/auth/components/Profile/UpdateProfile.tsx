import React, { useEffect, useState, useRef } from 'react';
import { useForm, FormProvider, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { updateProfileSchema, type UpdateProfileSchemaType } from '../../schemas/login.schema';
import { InputGroup } from '../../../../components/molecules/InputGroup';
import { Button } from '../../../../components/atoms/Button';
import { FormError } from '../../../../components/atoms/FormError';
import { useAuthActions } from '../../hooks/useAuthActions';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../../../components/atoms/Toast';
import { useUser } from '../../../../hooks/useUser';
import ImageUpload from '../../../../components/atoms/ImageUpload';
import { IMAGE_BASE_URL } from '../../../../config/api';
import PhoneWithCountry from '../../../../components/molecules/PhoneWithCountry';

// Import the correct type from PhoneWithCountry component
import type { PhoneWithCountryValue } from '../../../../components/molecules/PhoneWithCountry';

const UpdateProfile: React.FC = () => {
  const { loading, error, profile } = useAuth();
  const { fetchProfile, updateProfile, updateProfileImage } = useAuthActions();
  const toast = useToast();
  const user = useUser();

  const [imageUploading, setImageUploading] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const skipResetRef = useRef(false);
  const [isImageUploadInProgress, setIsImageUploadInProgress] = useState(false);

  const methods = useForm<UpdateProfileSchemaType>({
    resolver: zodResolver(updateProfileSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      countryCode: '',
      phoneNumber: '',
      organizationName: '',
      profileImage: '',
    },
  });

  const { reset, handleSubmit, control, setValue } = methods;

  const formValues = useWatch({ control });
  
  // Phone handling logic
  const phoneValue: PhoneWithCountryValue = {
    countryCode: formValues.countryCode || '',
    phoneNumber: formValues.phoneNumber || '',
    dialCode: formValues.countryCode ? `+${formValues.countryCode}` : '+91',
  };

  const handlePhoneChange = (value: PhoneWithCountryValue) => {
    setValue('countryCode', value.countryCode);
    setValue('phoneNumber', value.phoneNumber);
    // Also update the dialCode if needed
    if (value.dialCode && typeof value.dialCode === 'string') {
      setValue('countryCode', value.dialCode.replace('+', ''));
    }
  };
  
  // Debug: Log current form state and image URL
  useEffect(() => {
    // Form values debugging removed
  }, [formValues, profileImageUrl, profile?.profileImage]);

  // Fetch profile on load
  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
    }
  }, [user?.id]);

  // Reset only once from profile, but preserve form data after image upload
  useEffect(() => {
    console.log('🔍 Profile effect triggered:', { 
      hasProfile: !!profile, 
      skipReset: skipResetRef.current,
      isImageUploadInProgress,
      profileId: profile?.id 
    });
    
    // Only reset form on initial load, not during or after image uploads
    if (profile && !skipResetRef.current && !isImageUploadInProgress) {
      console.log('🔄 Resetting form with profile data:', profile);
      const tempImageUrl = localStorage.getItem('tempProfileImageUrl');
      const imageUrl = tempImageUrl || profile.profileImage || '';
      
      reset({
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        email: profile.email ?? '',
        countryCode: profile.countryCode ?? '',
        phoneNumber: profile.phoneNumber ?? '',
        organizationName: profile.organizationName ?? '',
        profileImage: imageUrl,
      });
      setProfileImageUrl(imageUrl || null);
      
      // Clear temporary storage if we used it
      if (tempImageUrl) {
        localStorage.removeItem('tempProfileImageUrl');
      }
    } else if (profile && (skipResetRef.current || isImageUploadInProgress)) {
      console.log('⏭️ Skipping form reset due to skip flag or image upload in progress');
    }
  }, [profile, reset, isImageUploadInProgress]);

  // Separate effect to handle profile image updates after upload
  useEffect(() => {
    if (profile && skipResetRef.current) {
      console.log('🖼️ Updating profile image only, preserving form data');
      // After image upload - only update the profileImage field, preserve all other form data
      const tempImageUrl = localStorage.getItem('tempProfileImageUrl');
      const imageUrl = tempImageUrl || profile.profileImage || '';
      
      // Only update the profileImage field, don't reset the entire form
      setValue('profileImage', imageUrl);
      setProfileImageUrl(imageUrl || null);
      
      // Clear temporary storage if we used it
      if (tempImageUrl) {
        localStorage.removeItem('tempProfileImageUrl');
      }
      
      // Reset the skip flag for future resets
      skipResetRef.current = false;
    }
  }, [profile, setValue]);

  const handleFileUpload = async (file: File) => {
    setImageUploading(true);
    setIsImageUploadInProgress(true);
    
    // Store current form data before upload
    const currentFormData = methods.getValues();
    console.log('📝 Current form data before upload:', currentFormData);
    
    try {
      console.log('📤 Starting image upload...');
      const fileUrl = await updateProfileImage(file);
      
      // Ensure fileUrl is a string
      const imageUrlString = typeof fileUrl === 'string' ? fileUrl : String(fileUrl);
      
      console.log('✅ Image upload successful, URL:', imageUrlString);
      setProfileImageUrl(imageUrlString);
      
      // Update the form field directly
      setValue('profileImage', imageUrlString);
      
      // Temporarily store in localStorage to persist across potential form resets
      localStorage.setItem('tempProfileImageUrl', imageUrlString);
      
      // Set skip flag to prevent form reset after profile update
      skipResetRef.current = true;
      console.log('🚫 Skip flag set to prevent form reset');
      
      // Check form data after upload
      const formDataAfterUpload = methods.getValues();
      console.log('📝 Form data after upload:', formDataAfterUpload);
      
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('❌ Image upload failed:', error);
      toast.error('Image upload failed');
    } finally {
      setImageUploading(false);
      // Keep the upload in progress flag for a bit longer to prevent any race conditions
      setTimeout(() => {
        setIsImageUploadInProgress(false);
        console.log('🏁 Image upload process completed');
      }, 1000);
    }
  };

  const onSubmit = async (data: UpdateProfileSchemaType) => {
    if (!user) return;

    try {
      // Check for temp storage as additional fallback
      const tempImageUrl = localStorage.getItem('tempProfileImageUrl');
      
      // Ensure profileImage is included - multiple fallbacks and always a string
      const profileImageValue = data.profileImage || profileImageUrl || tempImageUrl || profile?.profileImage || '';
      const updatedData = {
        ...data,
        profileImage: typeof profileImageValue === 'string' ? profileImageValue : String(profileImageValue || ''),
      };

      await updateProfile(updatedData, user.id);
      
      // Clear temporary storage after successful submission
      localStorage.removeItem('tempProfileImageUrl');
      
      skipResetRef.current = true;
      await fetchProfile(user.id);
      toast.success('Profile updated successfully');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update profile');
    }
  };

  // Function to get the full image URL
  const getFullImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath || typeof imagePath !== 'string') return '';
    // If it's already a full URL (starts with http), return as is
    if (imagePath.startsWith('http')) return imagePath;
    // Otherwise, construct the full URL with base URL
    return `${IMAGE_BASE_URL}/${imagePath.replace(/\\/g, '/')}`;
  };
  
  // Show loading state while profile is being fetched
  if (loading && !profile) {
    return (
      <div className="flex flex-col pt-6 pb-6 rounded-xl px-8 shadow-lg border gap-8 border-gray-300 bg-white">
        <h2 className="text-2xl font-semibold text-left text-gray-800 gap-4">Update Profile</h2>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col pt-6 pb-6 rounded-xl px-8 shadow-lg border gap-8 border-gray-300 bg-white">
      <h2 className="text-2xl font-semibold text-left text-gray-800 gap-4">Update Profile</h2>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className='grid grid-flow-col grid-rows-1 gap-4'>
          <div className="flex items-start justify-center space-x-4">
            <div className="flex items-center justify-center space-x-2">
              <ImageUpload 
                onFileSelect={handleFileUpload} 
                existingImageUrl={getFullImageUrl(profile?.profileImage || '')}
              />
              
            </div>
          </div>

          <div className="col-span-3 flex gap-4 flex-col">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white min-w-full">
          <InputGroup
              label="First Name"
              name="firstName"
              id="firstName"
              placeholder="Enter your first name"
              autoComplete="given-name"
              className="w-full"
            />
            <InputGroup
              label="Last Name"
              name="lastName"
              id="lastName"
              placeholder="Enter your last name"
              autoComplete="family-name"
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white min-w-full">
            <InputGroup
              label="Email"
              name="email"
              id="email"
              placeholder="Enter your email"
              autoComplete="email"
              className="w-full"
              disabled
            />
            <Controller
              name="phoneNumber"
              control={control}
              render={({ field, fieldState }) => (
                <PhoneWithCountry
                  label="Phone Number"
                  value={phoneValue}
                  onChange={handlePhoneChange}
                  error={fieldState.error?.message}
                  placeholder="Enter phone number"
                  id="phoneNumber"
                  required
                />
              )}
            />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white min-w-full">
            <InputGroup
              label="Organization Name"
              name="organizationName"
              id="organizationName"
              placeholder="Enter your organization name"
              autoComplete="organization"
              className="w-full"
            />
            </div>
            {/* Hidden field to track profileImage in form state */}
            <Controller
              name="profileImage"
              control={control}
              render={({ field }) => {
                // Use profileImageUrl if available (from upload), otherwise use existing profile image
                const currentValue = profileImageUrl || profile?.profileImage || '';
                
                // Ensure currentValue is always a string
                const stringValue = typeof currentValue === 'string' ? currentValue : String(currentValue || '');
                
                // Sync the field value with the current state
                React.useEffect(() => {
                  if (field.value !== stringValue && profile) {
                    field.onChange(stringValue);
                  }
                }, [stringValue, field, profile]);
                
                return (
                  <input
                    type="hidden"
                    value={field.value || ''}
                    onChange={field.onChange}
                    ref={field.ref}
                  />
                );
              }}
            />

            <FormError message={error ?? undefined} />
            <div className="col-span-2 flex justify-right space-x-4 mt-2">
            <Button type="submit" disabled={loading || imageUploading} className='ml-auto'>
              {loading || imageUploading ? 'Saving...' : 'Update Profile'}
            </Button>
          </div>
          </div>

         
        </form>
      </FormProvider>
    </div>
  );
};

export default UpdateProfile;
