import React, { useEffect, useState } from 'react';
import { employeeSchema } from '../schemas/employee.schema';
import type { EmployeeSchemaType } from '../schemas/employee.schema';
import { Form } from '../../../components/common/Form';
import { Button } from '../../../components/atoms/Button';
import { FormError } from '../../../components/atoms/FormError';
import { useEmployeeActions } from '../hooks/useEmployeeActions';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../../layouts/Layout';
import { useEmployee } from '../hooks/useEmployee';
import { useToast } from '../../../components/atoms/Toast';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Breadcrumbs from '../../../components/common/BreadCrumb';
import { detectCountryFromPhone } from '../../../utils/phoneUtils';
import { getUserDataFromStorage, isSuperAdmin } from '../../../utils/permissions';
import { TabNavigation } from '../../../components/common/TabNavigation';
import { BasicDetailsTab } from './BasicDetailsTab';
import { PermissionsTab } from './PermissionsTab';
import { User, Shield } from 'lucide-react';
import { z } from 'zod';


type EmployeeFormValues = EmployeeSchemaType;

const EmployeeForm: React.FC = () => {
  const employeeData = useEmployee();
  const { loading, formLoading, error, selectedEmployee, features = [] } = employeeData || {};
  const { addEmployee, fetchEmployeeById, fetchEnterpriseUserById, updateEmployee, fetchFeatures,getEnterpriseList,getEnterpriseFeatures } = useEmployeeActions();
  const { id } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  
  // Track if features have been loaded
  const [featuresLoaded, setFeaturesLoaded] = useState(false);
  
  // Tab navigation state
  const [activeTab, setActiveTab] = useState<'basic' | 'permissions'>('basic');
  const [basicDetailsCompleted, setBasicDetailsCompleted] = useState(false);
  
  // Enterprise-related state for Super Admin
  const [enterprises, setEnterprises] = useState<any[]>([]);
  const [selectedEnterpriseName, setSelectedEnterpriseName] = useState('');
  const [enterpriseFeatures, setEnterpriseFeatures] = useState<any[]>([]);
  
  const isUserSuperAdmin = isSuperAdmin(getUserDataFromStorage());
  
  // Load enterprises for Super Admin
  useEffect(() => {
    if (isUserSuperAdmin) {
      const loadEnterprises = async () => {
        try {
          const enterpriseData = await getEnterpriseList();
          setEnterprises(Array.isArray(enterpriseData) ? enterpriseData : []);
        } catch (error) {
          setEnterprises([]);
        }
      };
      loadEnterprises();
    }
  }, [isUserSuperAdmin]);

  // Load features and employee details - only once on mount or when ID changes
  useEffect(() => {
    fetchFeatures();
    if (id) {
      fetchEmployeeById(id);
    }
  }, [id]); // Only depend on id - functions are stable

  // Set enterprise ID for Super Admin when component loads
  useEffect(() => {
    if (isUserSuperAdmin && id) {
      // Call enterprise user API to get enterprise ID
      fetchEnterpriseUserById(id);
    }
  }, [id, isUserSuperAdmin, fetchEnterpriseUserById]);

  // Handle enterprise ID from enterprise user API response
  useEffect(() => {
    if (isUserSuperAdmin && selectedEmployee && selectedEmployee.enterpriseId && enterprises.length > 0) {
      // Find enterprise by ID from API response
      const matchedEnterprise = enterprises.find(ent => ent.id === selectedEmployee.enterpriseId);
      if (matchedEnterprise && !selectedEnterpriseName) {
        setSelectedEnterpriseName(matchedEnterprise.enterpriseName);
        setBasicDetailsCompleted(true);
        console.log('✅ Enterprise ID set from API response:', {
          enterpriseId: selectedEmployee.enterpriseId,
          enterpriseName: matchedEnterprise.enterpriseName
        });
      }
    }
  }, [selectedEmployee, isUserSuperAdmin, enterprises, selectedEnterpriseName]);

  // Debug: Log when selectedEmployee changes
  useEffect(() => {
    if (selectedEmployee) {
      console.log('📊 Selected Employee Data:', {
        id: selectedEmployee.id,
        enterpriseId: selectedEmployee.enterpriseId,
        enterpriseName: selectedEmployee.enterpriseName,
        features: selectedEmployee.features,
        isUserSuperAdmin
      });
    }
  }, [selectedEmployee, isUserSuperAdmin]);

  // Load enterprise features when enterprise is selected
  useEffect(() => {
    if (isUserSuperAdmin && selectedEnterpriseName) {
      const loadEnterpriseFeatures = async () => {
        try {
          // Find enterprise ID by name
          const selectedEnterprise = enterprises.find(ent => ent.enterpriseName === selectedEnterpriseName);
          if (selectedEnterprise) {
            const enterpriseFeatureData = await getEnterpriseFeatures(selectedEnterprise.id);
            setEnterpriseFeatures(Array.isArray(enterpriseFeatureData) ? enterpriseFeatureData : []);
          }
        } catch (error) {
          setEnterpriseFeatures([]);
        }
      };
      loadEnterpriseFeatures();
    } else if (!isUserSuperAdmin) {
      // For non-super admin, use all features
      setEnterpriseFeatures(features);
    }
  }, [isUserSuperAdmin, selectedEnterpriseName, features, enterprises]);

  // Use the employee schema directly
  const dynamicSchema = employeeSchema;

  // Set default values
  const methods = useForm<EmployeeFormValues>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
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
      features: [],
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

  const { reset } = methods;

  // Employee form when selectedEmployee is fetched
  useEffect(() => {
    if (id && selectedEmployee) {
      // Handle dial code vs country code
      let defaultCountryCode = selectedEmployee.countryCode || '';
      
      if (typeof defaultCountryCode === 'string' && defaultCountryCode.startsWith('+')) {
        // Already a dial code, use as is
      } else if (defaultCountryCode === 'IN') {
        // Convert country code to dial code
        defaultCountryCode = '+91';
      } else {
        // Try to detect from phone number
        const detectedCountry = detectCountryFromPhone(selectedEmployee.phoneNumber || '');
        defaultCountryCode = detectedCountry === 'IN' ? '+91' : '+1'; // Default fallback
      }
      
      // Format phone number - if it's Indian number without country code, add it
      let formattedPhoneNumber = selectedEmployee.phoneNumber || '';
      if (formattedPhoneNumber && formattedPhoneNumber.length === 10 && (defaultCountryCode === '+91' || defaultCountryCode === 'IN')) {
        formattedPhoneNumber = `91${formattedPhoneNumber}`;
      }
      
      const resetData = {
        firstName: selectedEmployee.firstName || '',
        lastName: selectedEmployee.lastName || '',
        email: selectedEmployee.email || '',
        organizationName: selectedEmployee.organizationName || '',
        countryCode: defaultCountryCode,
        phoneNumber: formattedPhoneNumber,
        address: selectedEmployee.address || '',
        city: selectedEmployee.city || '', 
        state: selectedEmployee.state || '',
        pincode: selectedEmployee.pincode || '',
        features: selectedEmployee.features?.map((f: any) => ({
          featureId: f.featureId,
          permissions: {
            read: f.permissions?.read ?? false,
            write: f.permissions?.write ?? false,
            admin: f.permissions?.admin ?? false,
          },
        })) || [],
      };

      reset(resetData);
      
      // Set enterprise for Super Admin in edit mode
      if (isUserSuperAdmin && (selectedEmployee.enterpriseId || selectedEmployee.enterpriseName) && enterprises.length > 0) {
        // Try to match by ID first, then by name as fallback
        let matchedEnterprise = enterprises.find(ent => ent.id === selectedEmployee.enterpriseId);
        
        // If no match by ID, try by enterprise name
        if (!matchedEnterprise && selectedEmployee.enterpriseName) {
          matchedEnterprise = enterprises.find(ent => ent.enterpriseName === selectedEmployee.enterpriseName);
        }
        
        if (matchedEnterprise) {
          setSelectedEnterpriseName(matchedEnterprise.enterpriseName);
          setBasicDetailsCompleted(true);
          console.log('✅ Enterprise set for Super Admin:', {
            enterpriseId: selectedEmployee.enterpriseId,
            enterpriseName: selectedEmployee.enterpriseName,
            matchedEnterprise: matchedEnterprise.enterpriseName
          });
        }
      }
    }
  }, [selectedEmployee, reset, isUserSuperAdmin, enterprises]);

  // Set enterprise when enterprises are loaded (for edit mode)
  useEffect(() => {
    if (id && selectedEmployee && isUserSuperAdmin && (selectedEmployee.enterpriseId || selectedEmployee.enterpriseName) && 
        enterprises.length > 0 && !selectedEnterpriseName) {
      // Try to match by ID first, then by name as fallback
      let matchedEnterprise = enterprises.find(ent => ent.id === selectedEmployee.enterpriseId);
      
      // If no match by ID, try by enterprise name
      if (!matchedEnterprise && selectedEmployee.enterpriseName) {
        matchedEnterprise = enterprises.find(ent => ent.enterpriseName === selectedEmployee.enterpriseName);
      }
      
      if (matchedEnterprise) {
        setSelectedEnterpriseName(matchedEnterprise.enterpriseName);
        setBasicDetailsCompleted(true);
      }
    }
  }, [enterprises, selectedEmployee, id, isUserSuperAdmin, selectedEnterpriseName]);

  // Load enterprise features when enterprise is selected in edit mode
  useEffect(() => {
    if (id && selectedEmployee && isUserSuperAdmin && selectedEnterpriseName && enterprises.length > 0) {
      const loadEnterpriseFeatures = async () => {
        try {
          const selectedEnterprise = enterprises.find(ent => ent.enterpriseName === selectedEnterpriseName);
          if (selectedEnterprise) {
            const enterpriseFeatureData = await getEnterpriseFeatures(selectedEnterprise.id);
            setEnterpriseFeatures(Array.isArray(enterpriseFeatureData) ? enterpriseFeatureData : []);
            
            // Re-populate form features with employee's existing permissions
            if (selectedEmployee.features) {
              const updatedFeatures = selectedEmployee.features.map((f: any) => ({
                featureId: f.featureId,
                permissions: {
                  read: f.permissions?.read ?? false,
                  write: f.permissions?.write ?? false,
                  admin: f.permissions?.admin ?? false,
                },
              }));
              methods.setValue('features', updatedFeatures);
            }
          }
        } catch (error) {
          setEnterpriseFeatures([]);
        }
      };
      loadEnterpriseFeatures();
    }
  }, [id, selectedEmployee, isUserSuperAdmin, selectedEnterpriseName, enterprises]);

  // Handle enterprise pre-selection when permissions tab becomes active
  useEffect(() => {
    if (activeTab === 'permissions' && id && selectedEmployee && isUserSuperAdmin && 
        (selectedEmployee.enterpriseId || selectedEmployee.enterpriseName) && enterprises.length > 0) {
      
      // Try to match by ID first, then by name as fallback
      let matchedEnterprise = enterprises.find(ent => ent.id === selectedEmployee.enterpriseId);
      
      // If no match by ID, try by enterprise name
      if (!matchedEnterprise && selectedEmployee.enterpriseName) {
        matchedEnterprise = enterprises.find(ent => ent.enterpriseName === selectedEmployee.enterpriseName);
      }
      
      if (matchedEnterprise && !selectedEnterpriseName) {
        setSelectedEnterpriseName(matchedEnterprise.enterpriseName);
      }
    }
  }, [activeTab, id, selectedEmployee, isUserSuperAdmin, enterprises, selectedEnterpriseName]);

  // For non-Super Admin: populate features in edit mode
  useEffect(() => {
    if (id && selectedEmployee && !isUserSuperAdmin && featuresLoaded && features.length > 0) {
      if (selectedEmployee.features) {
        const updatedFeatures = selectedEmployee.features.map((f: any) => ({
          featureId: f.featureId,
          permissions: {
            read: f.permissions?.read ?? false,
            write: f.permissions?.write ?? false,
            admin: f.permissions?.admin ?? false,
          },
        }));
        methods.setValue('features', updatedFeatures);
      }
    }
  }, [id, selectedEmployee, isUserSuperAdmin, featuresLoaded, features, methods]);

  // Initialize features for create mode - only after features are loaded
  useEffect(() => {
    if (!id && featuresLoaded && features && Array.isArray(features) && features.length > 0) {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        organizationName: '',
        countryCode: '+91', // Default to India dial code
        phoneNumber: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        features: (features || []).map((feature: any) => ({
          featureId: feature.id,
          permissions: { write: false, read: false, admin: false },
        })),
      });
    }
  }, [features, featuresLoaded, id, reset]);

  // Define validation schemas
  const basicInfoSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Valid email is required'),
    organizationName: z.string().min(1, 'Organization name is required'),
    phoneNumber: z.string().min(1, 'Phone number is required'),
    countryCode: z.string().min(1, 'Country code is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    pincode: z.string().min(1, 'Pincode is required'),
  });

  // Tab validation functions
  const validateBasicInfo = (): boolean => {
    const formData = methods.getValues();
    
    try {
      basicInfoSchema.parse(formData);
      setBasicDetailsCompleted(true);
      return true;
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const firstError = validationError.issues[0];
        toast.error(firstError.message);
      }
      setBasicDetailsCompleted(false);
      return false;
    }
  };

  // Handle tab change with validation
  const handleTabChange = (tabId: string) => {
    if (tabId === 'permissions') {
      // Validate basic info before moving to permissions
      if (validateBasicInfo()) {
        setActiveTab('permissions');
      }
    } else {
      setActiveTab(tabId as 'basic' | 'permissions');
    }
  };

  const onSubmit = async (
    data: EmployeeFormValues,
  ) => {
    try {
      // Final validation before submission
      if (!validateBasicInfo()) {
        setActiveTab('basic');
        return;
      }

      // For Super Admin, validate enterprise selection
      if (isUserSuperAdmin && !selectedEnterpriseName) {
        toast.error('Please select an enterprise');
        setActiveTab('permissions');
        return;
      }

      // Add enterprise information for Super Admin
      let submissionData: any = data;
      if (isUserSuperAdmin && selectedEnterpriseName) {
        // Find enterprise ID by name for submission
        const selectedEnterprise = enterprises.find(ent => ent.enterpriseName === selectedEnterpriseName);
        if (selectedEnterprise) {
          submissionData = { ...data, enterpriseId: selectedEnterprise.id };
        }
      }
        
      if(id) {
        // For Super Admin, call enterprise user API before updating
        if (isUserSuperAdmin) {
          try {
            await fetchEnterpriseUserById(id);
          } catch (error) {
            console.error('Failed to fetch enterprise user data:', error);
          }
        }
        
        await updateEmployee(id, submissionData);
        toast.success('Employee updated successfully');
        navigate('/employee-management');
      } else {
        await addEmployee(submissionData);
        toast.success('Employee created successfully');
        navigate('/employee-management'); 
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
  


  // Define tabs
  const tabs = [
    {
      id: 'basic',
      title: 'Basic Details',
      description: 'Personal and contact information',
      icon: <User className="w-5 h-5" />,
      completed: basicDetailsCompleted,
    },
    {
      id: 'permissions',
      title: 'Permissions',
      description: 'Feature access and enterprise settings',
      icon: <Shield className="w-5 h-5" />,
      completed: false,
    },
  ];

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          {id ? 'Edit Employee' : 'Create Employee'}
        </h2>
        <Breadcrumbs />
      </div>

      <FormProvider {...methods}>
        <Form<EmployeeSchemaType>
          mode="all"
          schema={dynamicSchema}
          onSubmit={onSubmit}
          className="min-w-full px-0 py-0"
        >
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl">
            {/* Tab Navigation */}
            <div className="px-6 pt-6">
              <TabNavigation
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                disabled={formLoading}
              />
            </div>

            {/* Tab Content */}
            <div className="px-6 pb-6">
              {activeTab === 'basic' && (
                <BasicDetailsTab isEditMode={!!id} />
              )}
              
              {activeTab === 'permissions' && (
                <PermissionsTab
                  isUserSuperAdmin={isUserSuperAdmin}
                  enterprises={enterprises}
                  selectedEnterpriseName={selectedEnterpriseName}
                  setSelectedEnterpriseName={setSelectedEnterpriseName}
                  setEnterpriseFeatures={setEnterpriseFeatures}
                  features={features}
                  enterpriseFeatures={enterpriseFeatures}
                  featuresLoaded={featuresLoaded}
                />
              )}
            </div>

            {/* Form Actions */}
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-3">
                  {activeTab === 'permissions' && (
                    <Button
                      type="button"
                      variant="muted"
                      size="sm"
                      onClick={() => setActiveTab('basic')}
                      disabled={formLoading}
                    >
                      ← Back to Basic Details
                    </Button>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="muted"
                    size="sm"
                    onClick={() => navigate('/employee-management')}
                    disabled={formLoading}
                  >
                    Cancel
                  </Button>

                  {activeTab === 'basic' ? (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => handleTabChange('permissions')}
                      disabled={formLoading}
                    >
                      Next: Permissions →
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={formLoading || !featuresLoaded}
                    >
                      {formLoading 
                        ? 'Saving...' 
                        : !featuresLoaded 
                          ? 'Loading Features...' 
                          : id 
                            ? 'Update Employee' 
                            : 'Create Employee'
                      }
                    </Button>
                  )}
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mt-4">
                  <FormError message={error} />
                </div>
              )}
            </div>
          </div>
        </Form>
      </FormProvider>
    </Layout>
  );
};

export default EmployeeForm;
