import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';


import { InputGroup } from '../../../components/molecules/InputGroup';
import { Button } from '../../../components/atoms/Button';
import { FormError } from '../../../components/atoms/FormError';

import { useToast } from '../../../components/atoms/Toast';

import { roleSchema, type RoleSchemaType } from '../schemas/role.schema';
import { useRoleActions } from '../hooks/useRoleActions';
import { useRole } from '../hooks/useRole';

import { FeaturePermissionTable } from '../../../components/common/FeaturePermissionTable';
import Breadcrumbs from '../../../components/common/BreadCrumb';
import Layout from '../../../layouts/Layout';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface RoleFormProps {
  editingRole?: any;
  onFormSubmit?: () => void;
  onCancel?: () => void;
}

const RoleForm: React.FC<RoleFormProps> = ({ editingRole, onFormSubmit, onCancel }) => {
  const { id } = useParams();

  const toast = useToast();
  
  // Track expand/collapse state for feature permissions
  const [isFeatureExpanded, setIsFeatureExpanded] = useState(false);
  
  // Use editingRole if provided, otherwise fall back to URL param
  const currentRole = editingRole || null;
  const isEmbedded = Boolean(onFormSubmit); // Check if component is embedded

  const { fetchRoleById, updateRole, addRole, fetchFeatures } = useRoleActions();
  const { selectedRole, features, formLoading: roleLoading, error } = useRole();

  const methods = useForm<RoleSchemaType>({
    resolver: zodResolver(roleSchema),
    mode: 'all',
    defaultValues: {
      name: '',
      featurePermissions: [],
    },
  });

  const { reset, formState: { errors, isDirty } } = methods;
  const navigate = useNavigate();
  useEffect(() => {
    const load = async () => {
      await fetchFeatures();
      if (id && !isEmbedded) {
        await fetchRoleById(id);
      }
    };
    load();
  }, [id, isEmbedded]);

  const isEditMode = Boolean(id) || Boolean(currentRole);
  const roleToEdit = isEmbedded ? currentRole : selectedRole;
  
  useEffect(() => {
    if (features.length > 0) {
      if (isEditMode && roleToEdit) {
        // Reset with role data (either from props or store)
        reset({
          name: roleToEdit.name,
          featurePermissions: features.map((feature: any) => {
            const matched = roleToEdit.featurePermissions?.find(
              (fp: any) => fp.featureId === feature.id
            );
            return {
              featureId: feature.id,
              permissions: {
                write: matched?.permissions?.write ?? false,
                read: matched?.permissions?.read ?? false,
                admin: matched?.permissions?.admin ?? false,
              },
            };
          }),
        });
      } else {
        // Reset for create mode with blank values
        reset({
          name: '',
          featurePermissions: features.map((feature: any) => ({
            featureId: feature.id,
            permissions: { write: false, read: false, admin: false },
          })),
        });
      }
    }
  }, [features, roleToEdit, isEditMode, reset, currentRole]);
  
  const onSubmit = async (data: RoleSchemaType) => {
    try {
      if (isEditMode && (id || currentRole)) {
        const roleId = id || currentRole?.id;
        await updateRole(roleId, data.name, data.featurePermissions);
        if (!isEmbedded) {
          toast.success('Role updated successfully');
          navigate('/role-management');
        }
      } else {
        await addRole(data.name, data.featurePermissions);
        if (!isEmbedded) {
          toast.success('Role created successfully');
          navigate('/role-management');
        }
      }
      
      if (isEditMode && (id || currentRole)) {
        // Don't navigate - stay on form for further edits
      } else {
        // Reset form for next entry instead of navigating
        reset({
          name: '',
          featurePermissions: features.map((feature: any) => ({
            featureId: feature.id,
            permissions: { write: false, read: false, admin: false },
          })),
        });
      }
      
      if (isEmbedded && onFormSubmit) {
        onFormSubmit();
      }
      // Remove navigation - let Redux state handle list updates
    } catch (err) {
      // The error is already handled by Redux actions and will be displayed via the error state
      // No need to show a toast here as the FormError component will display the specific error
    }
  };

  const onError = () => {
    // Form validation errors - handled by the form component
  };

  // Check if form can be submitted
  const canSubmit = useMemo(() => {
    if (isEditMode) {
      // For edit mode, require form to be dirty (has changes)
      return isDirty;
    } else {
      // For add mode, require at least name field to have content
      return isDirty && !!methods.watch('name')?.trim();
    }
  }, [isDirty, isEditMode, methods]);

  return (
    <>
     
    <Layout>
      <h2 className="text-xl font-semibold mb-2">{id ? 'Edit Role' : 'Create Role'}</h2>
       <Breadcrumbs/>
      <div className="text-gray-800 shadow-sm mt-5 max-w-3xl border  border-neutral-100 bg-white rounded-xl p-6">
        {/* <div className='flex justify-between items-center'>  
          <h2 className="text-xl font-semibold">{isEditMode ? 'Edit Role' : 'Create Role'}</h2>
          {isEditMode && isEmbedded && (
            <Button
              type="button"
              variant="muted"
              size="sm"
              onClick={() => {
                if (onCancel) {
                  onCancel();
                }
              }}
            >
              + Add New 
            </Button>
          )}
        </div> */}
       
        {/* <h2 className="text-xl font-semibold text-gray-800">Customer</h2> */}
        {/* <p className="text-sm text-gray-500 mb-6">
          Lorem ipsum dolor sit amet consectetur. Non ac nulla aliquam aenean in velit mattis.
        </p> */}
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit, onError)}>
              <InputGroup
                label="Role Name"
                name="name"
                id="name"
                placeholder="Enter role name"
                autoComplete="role-name"
                error={errors?.name?.message}
              />
            {/* Feature Permissions Section with Expand/Collapse */}
            <div className="mt-8 bg-gray-100">
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
                  <FeaturePermissionTable
                    features={features.map((feature: any) => ({
                      id: feature.id,
                      name: feature.name,
                    }))} 
                    name="featurePermissions"
                  />
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 mt-6">
              <Button 
                type="submit" 
                variant="primary" 
                size="sm" 
                disabled={roleLoading}
              >
                {roleLoading ? 'Saving...' : id ? 'Update Role' : 'Create Role'}
              </Button>
              
              <Button 
                type="button" 
                variant="muted" 
                size="sm"
                onClick={() => navigate('/role-management')}
              >
                Cancel
              </Button>
            </div>

            {error && <FormError message={error} />}
          </form>
        </FormProvider>
      </div>
      </Layout>
      </>
  );
};

export default RoleForm;
