import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputGroup } from '../../../components/molecules/InputGroup';
import { Button } from '../../../components/atoms/Button';
import { FormError } from '../../../components/atoms/FormError';
import { Form } from '../../../components/common/Form';
import { useToast } from '../../../components/atoms/Toast';
import { SelectGroup } from '../../../components/molecules/SelectGroup';
import { vendorSchema, createVendorSchema, type VendorSchemaType } from '../schemas/vendor.schema';
import { useVendor } from '../hooks/useVendor';
import { useVendorActions } from '../hooks/useVendorActions';
import type { DynamicForm, DynamicFormField } from '../../../types/Vendor';
import { Textarea } from '../../../components/atoms/Textarea';
import Layout from '../../../layouts/Layout';
import Breadcrumbs from '../../../components/common/BreadCrumb';
import LocationField from '../../../components/common/LocationField';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';
import { Label } from '../../../components/ui/label';
import MultiImageUpload from '../../../components/atoms/MultiImageUpload';
import { getUserDataFromStorage, isSuperAdmin } from '../../../utils/permissions';
import { useEnterpriseActions } from '../../enterprise/hooks/useEnterpriseActions';
import { useEnterprise } from '../../enterprise/hooks/useEnterprise';
import type { ServiceCategory } from '../../../types/ServiceCategory';
import api from '../../../axios';

interface DynamicFieldRendererProps {
  field: DynamicFormField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  uploadingImages?: Record<string, boolean>;
}

// Helper function to validate dynamic field values
const validateDynamicField = (field: DynamicFormField, value: any): string | undefined => {
  if (!field.validation) return undefined;
  
  const validation = field.validation;
  
  // Required validation
  if (validation.required?.value) {
    if (field.type === 'checkbox') {
      if (!Array.isArray(value) || value.length === 0) {
        return validation.required.message;
      }
    } else {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return validation.required.message;
      }
    }
  }
  
  // String length validations
  if (typeof value === 'string' && value.length > 0) {
    if (validation.min?.value && value.length < validation.min.value) {
      return validation.min.message;
    }
    if (validation.max?.value && value.length > validation.max.value) {
      return validation.max.message;
    }
    if (validation.regex?.value) {
      const regex = new RegExp(validation.regex.value);
      if (!regex.test(value)) {
        return validation.regex.message;
      }
    }
  }
  
  return undefined;
};

const DynamicFieldRenderer: React.FC<DynamicFieldRendererProps> = ({ 
  field, 
  value, 
  onChange, 
  error,
  uploadingImages = {}
}) => {
  // Use field.name if available, otherwise fall back to field.label
  const displayLabel = field.name || field.label;
  
  switch (field.type) {
    case 'text':
    case 'email':
    case 'number':
      return (
        <InputGroup
          label={displayLabel}
          name={field.id}
          id={field.id}
          type={field.type}
          placeholder={field.placeholder || `Enter ${displayLabel.toLowerCase()}`}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          error={error}
        />
      );
    
    case 'textarea':
      return (
        <div className="col-span-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {displayLabel} {field.required && <span className="text-red-500">*</span>}
          </label>
          <Textarea
            id={field.id}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-0 focus:ring-blue-500 focus:border-blue-500"
            placeholder={field.placeholder || `Enter ${displayLabel.toLowerCase()}`}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
          {error && <span className="text-red-500 text-sm">{error}</span>}
        </div>
      );
    
    case 'select':
      return (
        <div className="col-span-1">
          <SelectGroup
            label={displayLabel}
            options={field.options || []}
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
          <>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {displayLabel} {field.required && <span className="text-red-500">*</span>}
          </label>
          <div className="space-y-2">
            {field.options && field.options.map((option) => (
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
                  className="h-4 w-4 text-blue-600 focus:border-blue-500 border-gray-300 rounded-sm"
                />
                <label htmlFor={`${field.id}_${option.value}`} className="ml-2 block text-sm text-gray-900">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
          {error && <span className="text-red-500 text-sm">{error}</span>}
          </>
      );
    
    case 'radio':
      const normalizedOptions = (field.options || []).map((opt: any) =>
        typeof opt === "string" ? { label: opt, value: opt } : opt
      );
      return (
        <div className="col-span-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {displayLabel} {field.required && <span className="text-red-500">*</span>}
          </label>
          <RadioGroup value={value} onValueChange={onChange}>
            {normalizedOptions.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${field.id}-${index}`} />
                <Label
                  htmlFor={`${field.id}-${index}`}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {error && <span className="text-red-500 text-sm">{error}</span>}
        </div>
      );
    
    case 'date':
      return (
        <InputGroup
          label={displayLabel}
          name={field.id}
          id={field.id}
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          error={error}
        />
      );
    
    case 'date-range':
      const dateRange = value || { startDate: '', endDate: '' };
      return (
        <div className="col-span-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {displayLabel} {field.required && <span className="text-red-500">*</span>}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Start Date</label>
              <InputGroup
                name={`${field.id}_startDate`}
                id={`${field.id}_startDate`}
                type="date"
                value={dateRange.startDate || ''}
                onChange={(e) => onChange({ ...dateRange, startDate: e.target.value })}
                error={error}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">End Date</label>
              <InputGroup
                name={`${field.id}_endDate`}
                id={`${field.id}_endDate`}
                type="date"
                value={dateRange.endDate || ''}
                onChange={(e) => onChange({ ...dateRange, endDate: e.target.value })}
                error={error}
              />
            </div>
          </div>
          {error && <span className="text-red-500 text-sm">{error}</span>}
        </div>
      );
    
    case 'location':
      return (
        <div className="col-span-1 md:col-span-2">
          <LocationField
            value={value || {}}
            onChange={onChange}
            label={displayLabel}
            required={field.required}
            error={error}
          />
        </div>
      );
    
    case 'MultiImageUpload':
      return (
        <div className="col-span-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
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
          {uploadingImages[field.id] && (
            <div className="mt-2 text-sm text-blue-600">
              📤 Uploading images...
            </div>
          )}
          {error && <span className="text-red-500 text-sm">{error}</span>}
        </div>
      );
    
    default:
      return (
        <InputGroup
          label={displayLabel}
          name={field.id}
          id={field.id}
          placeholder={field.placeholder || `Enter ${displayLabel.toLowerCase()}`}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          error={error}
        />
      );
  }
};

const VendorForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const { fetchVendorById, updateVendor, addVendor, getServiceCategories, getDynamicFormByCategory } = useVendorActions();
  const { selectedVendor, loading: vendorLoading, error } = useVendor();
  const { getEnterpriseList } = useEnterpriseActions();
  const enterpriseState = useEnterprise();
  
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [dynamicForm, setDynamicForm] = useState<DynamicForm | null>(null);
  const [dynamicFormData, setDynamicFormData] = useState<Record<string, any>>({});
  const [dynamicFormErrors, setDynamicFormErrors] = useState<Record<string, string>>({});
  const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({});

  // Get user data to determine user type
  const userData = getUserDataFromStorage();
  const isUserSuperAdmin = isSuperAdmin(userData);
  const isEnterpriseUser = userData?.enterpriseId;

  const methods = useForm<VendorSchemaType>({
    resolver: zodResolver(createVendorSchema(isUserSuperAdmin && !isEnterpriseUser)),
    defaultValues: {
      name: '',
      description: '',
      serviceCategoryId: '',
      enterpriseId: isEnterpriseUser ? userData.enterpriseId : '',
      enterpriseName: isEnterpriseUser ? userData.organizationName : '',
    },
  });

  const { formState: { errors }, control, reset, watch } = methods;
  const watchedCategoryId = watch('serviceCategoryId');

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        await fetchVendorById(id);
      }
      
      // Load service categories
      const categories = await getServiceCategories();
      setServiceCategories(categories);
      
      // Load enterprises for admin users
      if (isUserSuperAdmin && !isEnterpriseUser) {
        try {
          await getEnterpriseList(1, 100, '');
      } catch (error) {
        // Failed to load enterprises
      }
      }
    };
    loadData();
  }, [id, isUserSuperAdmin, isEnterpriseUser]);

  const isEditMode = Boolean(id);
  
  useEffect(() => {
    if (isEditMode && selectedVendor) {
      // Handle both old vendorCategoryId and new serviceCategoryId structure
      const categoryId = selectedVendor.vendorCategoryId || selectedVendor.serviceCategoryId || selectedVendor.categoryId || '';
      
      reset({
        name: selectedVendor.name,
        description: selectedVendor.description || '',
        serviceCategoryId: categoryId,
        enterpriseId: selectedVendor.enterpriseId || '',
        enterpriseName: selectedVendor.enterpriseName || '',
      });
      setSelectedCategoryId(categoryId);
    }
  }, [selectedVendor, isEditMode, reset]);

  // Load dynamic form in edit mode
  useEffect(() => {
    const loadDynamicFormInEditMode = async () => {
      const categoryId = selectedVendor?.vendorCategoryId || selectedVendor?.serviceCategoryId || selectedVendor?.categoryId;
      if (isEditMode && selectedVendor && categoryId && !dynamicForm) {
        const form = await getDynamicFormByCategory(categoryId);
        setDynamicForm(form);
        
        // After loading the form, extract and set the dynamic form data
        if (selectedVendor.formData && selectedVendor.formData.fields && form && form.fields) {
          const extractedData: Record<string, any> = {};
          
          // Handle both array and object formats for fields
          if (Array.isArray(selectedVendor.formData.fields)) {
            // If fields is an array (old format)
            selectedVendor.formData.fields.forEach((field: any) => {
              if (field.actualValue !== undefined) {
                extractedData[field.id] = field.actualValue;
              }
            });
          } else if (typeof selectedVendor.formData.fields === 'object') {
            // If fields is an object (new format from API response)
            // Map field names to field IDs using the loaded form structure
            Object.entries(selectedVendor.formData.fields).forEach(([fieldName, value]) => {
              if (value !== undefined && value !== null) {
                // Find the field in the loaded form by name
                const matchingField = form.fields.find((f: any) => f.name === fieldName);
                if (matchingField) {
                  // Handle MultiImageUpload fields specially
                  if (matchingField.type === 'MultiImageUpload' && Array.isArray(value)) {
                    // Transform the image data to match the expected format
                     const transformedImages = value.map((img: any) => {
                       let imageUrl = '';
                       
                       // Safely extract URL from various possible structures
                       if (typeof img === 'string') {
                         imageUrl = img;
                       } else if (img?.url?.data && typeof img.url.data === 'string') {
                         imageUrl = img.url.data;
                       } else if (img?.url && typeof img.url === 'string') {
                         imageUrl = img.url;
                       } else if (img?.preview && typeof img.preview === 'string') {
                         imageUrl = img.preview;
                       }
                       
                       // If the URL is relative, construct the full URL
                       if (imageUrl && imageUrl.startsWith('/uploads/')) {
                         const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:10030";
                         imageUrl = `${baseUrl.replace('/api/v1/', '')}${imageUrl}`;
                       }
                       
                       return {
                         id: img.id || `img_${Date.now()}_${Math.random()}`,
                         name: img.name || 'image',
                         url: imageUrl,
                         uploaded: true // Mark as already uploaded
                       };
                     });
                    extractedData[matchingField.id] = transformedImages;
                  } else {
                    extractedData[matchingField.id] = value;
                  }
                } else {
                  // Fallback: use field name as key if no matching field found
                  extractedData[fieldName] = value;
                }
              }
            });
          }
          
          setDynamicFormData(extractedData);
        } else if (selectedVendor.dynamicFormData) {
          setDynamicFormData(selectedVendor.dynamicFormData || {});
        } else {
          setDynamicFormData({});
        }
      }
    };
    loadDynamicFormInEditMode();
  }, [isEditMode, selectedVendor, dynamicForm]);

  // Watch for service category changes and load dynamic form
  useEffect(() => {
    const loadDynamicForm = async () => {
      if (watchedCategoryId && watchedCategoryId !== selectedCategoryId) {
        setSelectedCategoryId(watchedCategoryId);
        const form = await getDynamicFormByCategory(watchedCategoryId);
        setDynamicForm(form);
        
        // Reset dynamic form data when category changes (except in edit mode initial load)
        const originalCategoryId = selectedVendor?.vendorCategoryId || selectedVendor?.serviceCategoryId || selectedVendor?.categoryId;
        if (!isEditMode || originalCategoryId !== watchedCategoryId) {
          setDynamicFormData({});
          setDynamicFormErrors({});
        }
      }
    };
    loadDynamicForm();
  }, [watchedCategoryId, selectedCategoryId, isEditMode, selectedVendor]);

  // Helper function to upload a single image immediately
  const uploadSingleImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.post('/vendors/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data.data; // Return the image URL
    } catch (error) {
      throw error;
    }
  };

  // Helper function to handle immediate image upload when images are selected
  const handleImageUpload = async (fieldId: string, images: any[]) => {
    setUploadingImages(prev => ({ ...prev, [fieldId]: true }));
    
    try {
      const uploadedImages = await Promise.all(
        images.map(async (img: any) => {
          if (img.file && !img.url) {
            // Upload new file
            const url = await uploadSingleImage(img.file);
            return {
              ...img,
              url: url,
              uploaded: true
            };
          }
          // Return existing image (already uploaded)
          return {
            ...img,
            uploaded: true
          };
        })
      );
      
      // Update the form data with uploaded images
      setDynamicFormData(prev => ({
        ...prev,
        [fieldId]: uploadedImages
      }));
      
    } catch (error) {
      toast.error('Failed to upload images. Please try again.');
    } finally {
      setUploadingImages(prev => ({ ...prev, [fieldId]: false }));
    }
  };

  // Helper function to convert form data to JSON format
  const createJsonData = (data: VendorSchemaType) => {
    const jsonData: any = {
      categoryId: data.serviceCategoryId,
      name: data.name,
      title: data.name, // Use name as title if not provided separately
      description: data.description || '',
      enterpriseId: data.enterpriseId || '',
      enterpriseName: data.enterpriseName || '',
    };

    // Process dynamic form fields (images are already uploaded)
    if (dynamicForm && dynamicForm.fields) {
      const processedFields: Record<string, any> = {};
      let firstImageUrl = '';

      dynamicForm.fields.forEach(field => {
        const fieldValue = dynamicFormData[field.id] || field.metadata?.defaultValue || '';
        
        if (field.type === 'MultiImageUpload' && Array.isArray(fieldValue)) {
          // Images are already uploaded, just extract URLs
          const imageData = fieldValue.map((img: any) => ({
            id: img.id || `img_${Date.now()}_${Math.random()}`,
            name: img.name || `image_${Math.random()}.jpg`,
            url: img.url || ''
          }));
          
          processedFields[field.name || field.label] = imageData;
          
          // Set first image as main image
          if (!firstImageUrl && imageData.length > 0 && imageData[0].url) {
            firstImageUrl = imageData[0].url;
          }
        } else {
          // Handle other field types
          processedFields[field.name || field.label] = fieldValue;
        }
      });

      // Create the formData object in the expected format
      jsonData.formData = {
        _id: dynamicForm.id,
        name: dynamicForm.name,
        description: dynamicForm.description || '',
        categoryId: data.serviceCategoryId,
        type: 'vendor-service',
        fields: processedFields,
        key: dynamicForm.key || '',
        isActive: true,
        isDeleted: false,
        createdBy: 'system',
        updatedBy: 'system',
        createdAt: dynamicForm.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add imageUrl if we have uploaded images
      if (firstImageUrl) {
        jsonData.imageUrl = firstImageUrl;
      }
    }

    return jsonData;
  };

  const onSubmit = async (data: VendorSchemaType) => {
    try {
      // Validate dynamic form fields
      if (!validateDynamicForm()) {
        toast.error('Please fix the errors in the form fields.');
        return;
      }

      // Create JSON data (images are already uploaded)
      const jsonData = createJsonData(data);

      if (id) {
        await updateVendor(id, jsonData);
        toast.success('Vendor updated successfully');
      } else {
        await addVendor(jsonData);
        toast.success('Vendor created successfully');
      }
      navigate('/vendor-management');
    } catch (err) {
      toast.error('Something went wrong.');
    }
  };

  const handleDynamicFieldChange = (fieldId: string, value: any) => {
    // Check if this is an image field
    const field = dynamicForm?.fields.find(f => f.id === fieldId);
    
    if (field?.type === 'MultiImageUpload' && Array.isArray(value)) {
      // Handle immediate image upload for MultiImageUpload fields
      handleImageUpload(fieldId, value);
    } else {
      // Handle other field types normally
      setDynamicFormData(prev => ({
        ...prev,
        [fieldId]: value
      }));
    }
    
    // Clear error for this field when user starts typing
    if (dynamicFormErrors[fieldId]) {
      setDynamicFormErrors(prev => {
        const { [fieldId]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  // Validate dynamic form fields
  const validateDynamicForm = (): boolean => {
    if (!dynamicForm || !dynamicForm.fields) return true;
    
    const errors: Record<string, string> = {};
    let isValid = true;
    
    dynamicForm.fields.forEach(field => {
      const error = validateDynamicField(field, dynamicFormData[field.id]);
      if (error) {
        errors[field.id] = error;
        isValid = false;
      }
    });
    
    setDynamicFormErrors(errors);
    return isValid;
  };

  return (
    <>
    <Layout>
    <h2 className="text-xl font-semibold mb-2">{id ? 'Edit Vendor' : 'Create Vendor'}</h2>
    <Breadcrumbs/>
    <div className="text-gray-800 shadow-sm mt-5 max-w-3xl border  border-neutral-100 bg-white rounded-xl p-6">
        <div className="grid grid-cols-1">
          <FormProvider {...methods}>
            <Form<VendorSchemaType>
              mode="all"
              schema={vendorSchema}
              onSubmit={onSubmit} 
              className='bg-white text-gray-800'
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup
                  label="Title"
                  name="name"
                  id="name"
                  placeholder="Enter title"
                  autoComplete="vendor-name"
                  error={errors?.name?.message}
                />
                
                <InputGroup
                  label="Description"
                  name="description"
                  id="description"
                  placeholder="Enter description"
                  autoComplete="description"
                  error={errors?.description?.message}
                />
              </div>

              {/* Enterprise Selection */}
              {isUserSuperAdmin && !isEnterpriseUser && (
                <div className="mt-4">
                  <Controller
                    name="enterpriseId"
                    control={control}
                    render={({ field, fieldState }) => {
                      const selectedEnterprise = enterpriseState.enterprises?.find((enterprise: any) =>
                        enterprise.id === field.value
                      ) || null;
                      return (
                        <div className="col-span-1">
                          <SelectGroup
                            label="Select Enterprise"
                            options={enterpriseState.enterprises?.map((enterprise: any) => ({
                              label: enterprise.enterpriseName,
                              value: enterprise.id,
                            })) || []}
                            value={selectedEnterprise ? [{
                              label: selectedEnterprise.enterpriseName,
                              value: selectedEnterprise.id
                            }] : []}
                            onChange={(selected) => {
                              const value = Array.isArray(selected) ? selected[0]?.value : '';
                              const enterpriseName = Array.isArray(selected) ? selected[0]?.label : '';
                              field.onChange(value);
                              methods.setValue('enterpriseName', enterpriseName);
                            }}
                            isMulti={false}
                            error={fieldState.error?.message}
                          />
                        </div>
                      );
                    }}
                  />
                </div>
              )}

              <div className="mt-4">
                <Controller
                  name="serviceCategoryId"
                  control={control}
                  render={({ field, fieldState }) => {
                    // Service categories and field values
                    
                    const selectedOption = serviceCategories.find((category: ServiceCategory) => 
                      category.id === field.value
                    ) || null;

                    return (
                      <div className="col-span-1">
                        <SelectGroup
                          label="Service Category"
                          options={serviceCategories.map((category: ServiceCategory) => ({
                            label: category.name,
                            value: category.id,
                          }))}
                          value={selectedOption ? [{
                            label: selectedOption.name,
                            value: selectedOption.id
                          }] : []}
                          onChange={(selected) => {
                            const value = Array.isArray(selected) ? selected[0]?.value : '';
                            field.onChange(value);
                          }}
                          isMulti={false}
                          error={fieldState.error?.message}
                        />
                      </div>
                    );
                  }}
                />
              </div>

              {/* Show enterprise info for Enterprise users */}
              {isEnterpriseUser && (
                <div className="mt-4 p-4 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Enterprise:</strong> {userData.organizationName}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    This vendor will be associated with your enterprise account.
                  </p>
                </div>
              )}

              {/* Dynamic Form Fields */}
              {dynamicForm && dynamicForm.fields && dynamicForm.fields.length > 0 ? (
                  <>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-6">
                    {dynamicForm.name} Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dynamicForm.fields.map((field: DynamicFormField) => (
                      <DynamicFieldRenderer
                        key={field.id}
                        field={field}
                        value={dynamicFormData[field.id]}
                        onChange={(value) => handleDynamicFieldChange(field.id, value)}
                        error={dynamicFormErrors[field.id]}
                        uploadingImages={uploadingImages}
                      />
                    ))}
                  </div>
                  </>
              ) : (
                <div className="mt-6 p-4 bg-gray-50 rounded-md">
                  <p className="text-gray-600">
                    {dynamicForm ? 'No fields found in the dynamic form.' : 'Select a service category to load dynamic form fields.'}
                  </p>
                  {dynamicForm && (
                    <pre className="mt-2 text-xs text-gray-500">
                      {JSON.stringify(dynamicForm, null, 2)}
                    </pre>
                  )}
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <Button type="submit" variant="primary" disabled={vendorLoading}>
                  {vendorLoading ? 'Saving...' : id ? 'Update Vendor' : 'Create Vendor'}
                </Button>
                <Button
                  type="button"
                  variant="muted"
                  onClick={() => navigate('/vendor-management')}
                >
                  Cancel
                </Button>
              </div>
              {error && <FormError message={error} />}
            </Form>
          </FormProvider>
        </div>
      </div>
    </Layout>
    </>
  );
};

export default VendorForm;
