import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { Form } from '../../../components/common/Form';
import Layout from '../../../layouts/Layout';
import { useToast } from '../../../components/atoms/Toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useVenue } from '../hooks/useVenue';
import { venueSchema, type VenueSchemaType } from '../schemas/venue.schema';
import { useVenueActions } from '../hooks/useVenueAction';
import { InputGroup } from '../../../components/molecules/InputGroup';
import { Button } from '../../../components/atoms/Button';
import { FormError } from '../../../components/atoms/FormError';
import api from '../../../axios';
import { SelectGroup } from '../../../components/molecules/SelectGroup';
import { API_ROUTES, ROUTING } from '../../../constants/routes';
import type { DynamicFormField } from '../../../types/Vendor';
import DynamicFieldForm from '../../../components/common/DynamicFieldForm';
import Breadcrumbs from '../../../components/common/BreadCrumb';
import { Textarea } from '../../../components/atoms/Textarea';
import { getUserDataFromStorage, isSuperAdmin } from '../../../utils/permissions';
import { useEnterpriseActions } from '../../enterprise/hooks/useEnterpriseActions';
import { useEnterprise } from '../../enterprise/hooks/useEnterprise';
import { createVenueSchema } from '../schemas/venue.schema';
type VenueFormValues = VenueSchemaType;

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

const AddVenueForm: React.FC = () => {
  const { id } = useParams();
  const [selectedCategory, setSelectedCategory] = useState<any>([]);
  const [getSelectedForm, setSelectedForm] = useState<any>();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoadingVenue, setIsLoadingVenue] = useState(false);
  const { loading: venueLoading, error } = useVenue();
  const { addVenue, updateVenue, getServiceCategories, getDynamicFormByCategory } = useVenueActions();
  const { getEnterpriseList } = useEnterpriseActions();
  const enterpriseState = useEnterprise();
  const [dynamicFormErrors, setDynamicFormErrors] = useState<Record<string, string>>({});

  const toast = useToast();
  const navigate = useNavigate();

  // Get user data to determine user type
  const userData = getUserDataFromStorage();
  const isUserSuperAdmin = isSuperAdmin(userData);
  const isEnterpriseUser = userData?.enterpriseId;

  useEffect(() => {
    getCategoryList();
    
    // Load enterprises for admin users
    if (isUserSuperAdmin && !isEnterpriseUser) {
      getEnterpriseList(1, 100, '');
    }
  }, [isUserSuperAdmin, isEnterpriseUser]);

  const getCategoryList = async () => {
    try {
      const categories = await getServiceCategories();
      setSelectedCategory(categories);
    } catch (error) {
      setSelectedCategory([]);
    }
  }

  // Set default values
  const methods = useForm<VenueFormValues>({
    resolver: zodResolver(createVenueSchema(isUserSuperAdmin && !isEnterpriseUser)),
    defaultValues: {
      name: '',
      description: '',
      serviceCategoryId: '',
      enterpriseId: isEnterpriseUser ? userData.enterpriseId : '',
      enterpriseName: isEnterpriseUser ? userData.organizationName : '',
    },
  });

  const { control, setValue, watch } = methods;
  const watchedCategoryId = watch('serviceCategoryId');

  // Load venue data when editing
  useEffect(() => {
    if (!id) return;

    const timeout = setTimeout(async () => {
      try {
        setIsLoadingVenue(true);
        const response = await api.get(`${API_ROUTES.VENUE}/${id}`);
        if (response?.data?.data) {
          const venueData = response?.data?.data;

          // Set form values using react-hook-form's setValue
          setValue('name', venueData?.name || '');
          setValue('description', venueData?.description || '');
          setValue('serviceCategoryId', venueData?.serviceCategoryId || venueData?.categoryId || '');

          // Store venue data for later processing
          if (venueData?.formData?.fields) {
            setSelectedForm(venueData?.formData);
            
            // Store the raw venue data for processing after form loads
            setFormData(venueData?.formData?.fields || {});
          }
        }
      } catch (error) {
        toast.error('Failed to load venue data');
      } finally {
        setIsLoadingVenue(false);
      }
    }, 500); // debounce delay
    return () => clearTimeout(timeout); // cleanup
  }, [id, setValue]);

  // Load dynamic form in edit mode and process venue data
  useEffect(() => {
    const loadDynamicFormInEditMode = async () => {
      if (id && getSelectedForm && getSelectedForm.fields && getSelectedForm.fields.length > 0) {
        console.log('Loading dynamic form for edit mode, form:', getSelectedForm);
        
        // Process venue data after form is loaded
        if (typeof formData === 'object' && !Array.isArray(formData)) {
          const processedData: Record<string, any> = {};
          
          Object.entries(formData).forEach(([fieldName, value]) => {
            if (value !== undefined && value !== null) {
              // Find the field in the loaded form structure by name
              const matchingField = getSelectedForm.fields.find((f: any) => f.name === fieldName);
              
              if (matchingField?.type === 'MultiImageUpload' && Array.isArray(value)) {
                // Handle MultiImageUpload fields specially
                const transformedImages = value.map((img: any) => {
                  let imageUrl = img.url?.data || img.url || img;
                  
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
                processedData[matchingField.id] = transformedImages;
              } else if (matchingField) {
                processedData[matchingField.id] = value;
              } else {
                // Fallback: use field name as key if no matching field found
                processedData[fieldName] = value;
              }
            }
          });
          
          console.log('Setting processed venue form data:', processedData);
          setFormData(processedData);
        }
      }
    };
    loadDynamicFormInEditMode();
  }, [id, getSelectedForm]);

  // Watch for service category changes and load dynamic form
  useEffect(() => {
    const loadDynamicForm = async () => {
      if (watchedCategoryId) {
        console.log('Loading dynamic form for category:', watchedCategoryId);
        const form = await getDynamicFormByCategory(watchedCategoryId);
        console.log('Dynamic form loaded:', form);
        setSelectedForm(form);
        
        // Reset dynamic form data when category changes
        setFormData({});
        setDynamicFormErrors({});
      }
    };
    loadDynamicForm();
  }, [watchedCategoryId]);

  // Helper function to convert form data to FormData for binary uploads
  const createFormData = (data: VenueSchemaType) => {
    const formDataObj = new FormData();

    // Add basic venue data
    formDataObj.append('name', data.name);
    formDataObj.append('description', data.description || '');
    formDataObj.append('serviceCategoryId', data.serviceCategoryId);
    formDataObj.append('formId', getSelectedForm?.formId || '');
    formDataObj.append('enterpriseId', data.enterpriseId || '');
    formDataObj.append('enterpriseName', data.enterpriseName || '');

    // Process dynamic form fields and handle images
    if (getSelectedForm && getSelectedForm.fields) {
      const processedFields = getSelectedForm.fields.map(field => {
        const fieldValue = formData[field.id] || field.metadata?.defaultValue || '';
        
        // Handle MultiImageUpload fields - extract File objects
        if (field.type === 'MultiImageUpload' && Array.isArray(fieldValue)) {
          // For MultiImageUpload, we'll append files separately and store metadata
          return {
            ...field,
            actualValue: fieldValue.map((img: any) => ({
              id: img.id,
              name: img.name,
              // Don't include the file object in JSON, it will be sent separately
            }))
          };
        }
        
        return {
          ...field,
          actualValue: fieldValue
        };
      });

      const formDataWithValues = {
        _id: getSelectedForm.id,
        name: getSelectedForm.name,
        description: getSelectedForm.description || '',
        categoryId: data.serviceCategoryId,
        type: 'venue-service',
        fields: processedFields,
        key: getSelectedForm.key || '',
        isActive: true,
        isDeleted: false,
        createdBy: 'system',
        updatedBy: 'system',
        createdAt: getSelectedForm.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      formDataObj.append('formData', JSON.stringify(formDataWithValues));

      // Append image files separately with static parameter name
      getSelectedForm.fields.forEach(field => {
        if (field.type === 'MultiImageUpload') {
          const fieldValue = formData[field.id];
          if (Array.isArray(fieldValue)) {
            fieldValue.forEach((img: any) => {
              if (img.file) {
                formDataObj.append('images', img.file);
              }
            });
          }
        }
      });
    }

    return formDataObj;
  };

  const onSubmit = async (data: VenueSchemaType) => {

    // Additional manual validation check
    if (!data.name || data.name.trim() === '') {
      toast.error('Venue Title is required');
      return;
    }

    if (!data.serviceCategoryId || data.serviceCategoryId.trim() === '') {
      toast.error('Service Category is required');
      return;
    }

    if (!validateDynamicForm()) {
      toast.error('Need to filled mandatory fields.');
      return;
    }
    try {
      // Create FormData for binary upload
      const formDataObj = createFormData(data);

      if (id) {
        await updateVenue(id, formDataObj);
        toast.success('Venue updated successfully');
      } else {
        await addVenue(formDataObj);
        toast.success('Venue created successfully');
      }
      navigate(ROUTING.VENUE_MANAGEMENT);

    } catch (err) {
      toast.error('Something went wrong.');
    }
  };

  const validateDynamicForm = (): boolean => {
    if (!getSelectedForm || !getSelectedForm.fields) return true;

    const errors: Record<string, string> = {};
    let isValid = true;

    getSelectedForm.fields.forEach((field: any) => {
      const fieldValue = formData[field.id];
      const error = validateDynamicField(field, fieldValue);
      if (error) {
        errors[field.id] = error;
        isValid = false;
      }
    });

    setDynamicFormErrors(errors);
    return isValid;
  };
  const handleFieldChange = (data: any, fieldId: any, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));

    // Clear error for this field when user starts typing
    if (dynamicFormErrors[data.id]) {
      setDynamicFormErrors(prev => {
        const { [data.id]: removed, ...rest } = prev;
        return rest;
      });
    }
  };
  return (
    <Layout>
      <h2 className="text-xl font-semibold mb-2">{id ? 'Edit Venue' : 'Create Venue'}</h2>
      <Breadcrumbs/>
      <div className="text-gray-800 shadow-sm mt-5 max-w-3xl border border-neutral-100 bg-white rounded-xl p-6">
        <p className="text-sm text-gray-500 mb-6">
          {id ? 'Edit a new venue' : 'Venue management'}.
        </p>

        {isLoadingVenue && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading venue data...</p>
            </div>
          </div>
        )}
        {/* Form */}
        <FormProvider {...methods}>
          <Form<VenueSchemaType>
            mode="all"
            schema={venueSchema}
            onSubmit={onSubmit}
          >
            {!isLoadingVenue && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputGroup
                    label="Title"
                    name="name"
                    id="name"
                    placeholder="Enter venue title"
                    autoComplete="name"
                  />
                  {/* Enterprise Selection */}
                  {isUserSuperAdmin && !isEnterpriseUser && (
                    <Controller
                      name="enterpriseId"
                      control={control}
                      render={({ field, fieldState }) => {
                        const selectedEnterprise = enterpriseState.enterprises?.find((enterprise: any) =>
                          enterprise.id === field.value
                        ) || null;
                        return (
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
                        );
                      }}
                    />
                  )}

                  <Controller
                    name="serviceCategoryId"
                    control={control}
                    render={({ field, fieldState }) => {
                      const selectedOption = (selectedCategory || []).find((opt: any) => opt?.id === field?.value) || null;
                      return (
                        <>
                          <SelectGroup
                            label="Service Category"
                            className='min-h-[363px] text-gray-800'
                            options={(selectedCategory || []).map((cat: any) => ({
                              label: cat?.name,
                              value: cat?.id,
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
                        </>
                      );
                    }}
                  />
                </div>

                <div className="mt-4">
                  <Controller
                    name="description"
                    control={control}
                    render={({ field, fieldState }) => (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Description
                        </label>
                        <Textarea
                          id="description"
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-0 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter venue description"
                          value={field.value}
                          onChange={field.onChange}
                        />
                        {fieldState.error?.message && (
                          <span className="text-red-500 text-sm">{fieldState.error.message}</span>
                        )}
                      </div>
                    )}
                  />
                </div>
                {/* Dynamic Form Fields */}
                {console.log('Rendering dynamic form section. getSelectedForm:', getSelectedForm)}
                {getSelectedForm && getSelectedForm.fields && getSelectedForm.fields.length > 0 ? (
                    <>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 mt-6 capitalize">
                      {getSelectedForm?.name} Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {console.log('Rendering fields:', getSelectedForm.fields)}
                      {(getSelectedForm?.fields || []).map((field: DynamicFormField, index: number) => (
                        <DynamicFieldForm
                          key={index}
                          field={field}
                          value={formData[field.id] || ''}
                          onChange={(value) => handleFieldChange(field, field.id, value)}
                          error={dynamicFormErrors[field.id]}
                        />
                      ))}
                    </div>
                  </>    
                ) : (
                  <div className="mt-6 p-4 bg-gray-50 rounded-md">
                    <p className="text-gray-600">
                      {getSelectedForm ? 'No fields found in the dynamic form.' : 'Select a service category to load dynamic form fields.'}
                    </p>
                    {getSelectedForm && (
                      <pre className="mt-2 text-xs text-gray-500">
                        {JSON.stringify(getSelectedForm, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
                <div className="flex gap-4 pt-6">
                  <Button type="submit" variant="primary" disabled={venueLoading}>
                    {venueLoading ? 'Saving...' : id ? 'Update Venue' : 'Create Venue'}
                  </Button>
                  <Button
                    type="button"
                    variant="muted"
                    onClick={() => navigate(ROUTING.VENUE_MANAGEMENT)}
                  >
                    Cancel
                  </Button>
                </div>
                {error && <FormError message={error} />}
              </>
            )}
          </Form>
        </FormProvider>
      </div>
    </Layout>
  );
};

export default AddVenueForm;
