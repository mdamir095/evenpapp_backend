import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { InputGroup } from '../../../components/molecules/InputGroup';
import { Button } from '../../../components/atoms/Button';
import { FormError } from '../../../components/atoms/FormError';

import { useToast } from '../../../components/atoms/Toast';
import { featureSchema, type FeatureSchemaType } from '../schemas/feature.schema';
import { useFeature } from '../hooks/useFeature';
import { useFeatureActions } from '../hooks/useFeatureActions';
import { CheckboxWithLabel } from '../../../components/molecules/CheckboxWithLabel';
import Breadcrumbs from '../../../components/common/BreadCrumb';
import Layout from '../../../layouts/Layout';

interface FeatureFormProps {
  editingFeature?: any;
  onFormSubmit?: () => void;
  onCancel?: () => void;
}

const FeatureForm: React.FC<FeatureFormProps> = ({ editingFeature, onFormSubmit, onCancel }) => {
  const { id } = useParams();

  const toast = useToast();
  
  // Use editingFeature if provided, otherwise fall back to URL param
  const currentFeature = editingFeature || null;
  const isEmbedded = Boolean(onFormSubmit); // Check if component is embedded

  const { fetchFeatureById, updateFeature, addFeature } = useFeatureActions();
  const { selectedFeature, formLoading: featureLoading, error } = useFeature();
  const navigate = useNavigate();

  const methods = useForm<FeatureSchemaType>({
    resolver: zodResolver(featureSchema),
    mode: 'all',
    defaultValues: {
      name: '',
      isActive: false,
    },
  });
   const { formState: { errors, isDirty } } = methods;

  const { reset, control } = methods;

  useEffect(() => {
    const load = async () => {
      if (id && !isEmbedded) {
        await fetchFeatureById(id);
      }
    };
    load();
  }, [id, isEmbedded]);

  const isEditMode = Boolean(id) || Boolean(currentFeature);
  const featureToEdit = isEmbedded ? currentFeature : selectedFeature;
  
  useEffect(() => {
    if (isEditMode && featureToEdit) {
      reset({
        name: featureToEdit.name,
        isActive: featureToEdit.isActive || false,
      });
    } else {
      // Reset for create mode
      reset({
        name: '',
        isActive: false,
      });
    }
  }, [featureToEdit, isEditMode, reset, currentFeature]);
  

  const onSubmit = async (data: FeatureSchemaType) => {
    try {
      
      if (isEditMode && (id || currentFeature)) {
        const featureId = id || currentFeature?.id;
        await updateFeature(featureId, data.name, data.isActive || false);
        if (!isEmbedded) {
          toast.success('Feature updated successfully');
          navigate('/feature-management');
        }
        // Don't navigate - stay on form for further edits
      } else {
        await addFeature(data.name, data.isActive || false);
        if (!isEmbedded) {
          toast.success('Feature created successfully');
          navigate('/feature-management');
        }
        // Reset form for next entry instead of navigating
        reset({
          name: '',
          isActive: false,
        });
      }
      
      if (isEmbedded && onFormSubmit) {
        onFormSubmit();
      }
      // Remove navigation - let Redux state handle list updates
    } catch (error: any) {
      // Display error via toast as fallback
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.message || 
                          'Something went wrong';
      
      if (!isEmbedded) {
        toast.error(errorMessage);
      }
    }
  };
  
  const onError = (errors: any) => {
    // Form validation errors handled by the form
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
       <h2 className="text-xl font-semibold mb-2">{id ? 'Edit Feature' : 'Create Feature'}</h2>
       <Breadcrumbs/>
        <div className="text-gray-800 shadow-sm mt-5 max-w-3xl border  border-neutral-100 bg-white rounded-xl p-6">
          {/* <div className="flex justify-between items-center">
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
          <div className="grid grid-cols-1">
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit, onError)} className=' bg-white text-gray-800'>
                <div className="grid grid-cols-1 md:grid-row-1 gap-4">
                  <InputGroup
                    label="Feature Name"
                    name="name"
                    id="name"
                    placeholder="Enter feature name"
                    autoComplete="feature-name"
                    error={errors?.name?.message}
                  />
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <CheckboxWithLabel
                        label="Is Active"
                        name="isActive"
                        id="isActive"
                        checked={field.value || false}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-row-1 gap-4">
                
                </div>

                <div className="flex gap-4 pt-6">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="sm"
                    disabled={featureLoading || !canSubmit}
                  >
                    {featureLoading ? 'Saving...' : isEditMode ? 'Update Feature' : 'Create Feature'}
                  </Button>
                </div>
                {error && <FormError message={error} className="mt-4" />}
              </form>
            </FormProvider>
          </div>
        </div>
       </Layout>
      </>
   
  );
};

export default FeatureForm;
