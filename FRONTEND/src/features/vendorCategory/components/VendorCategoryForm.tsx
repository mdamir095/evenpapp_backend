import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputGroup } from '../../../components/molecules/InputGroup';
import { Button } from '../../../components/atoms/Button';
import { FormError } from '../../../components/atoms/FormError';
import { Form } from '../../../components/common/Form';
import { useToast } from '../../../components/atoms/Toast';
import { SelectGroup } from '../../../components/molecules/SelectGroup';
import { vendorCategorySchema, type VendorCategorySchemaType } from '../schemas/vendorCategory.schema';
import { useVendorCategory } from '../hooks/useVendorCategory';
import { useVendorCategoryActions } from '../hooks/useVendorCategoryActions';
import type { Form as FormType } from '../../../types/VendorCategory';
import Layout from '../../../layouts/Layout';
import Breadcrumbs from '../../../components/common/BreadCrumb';

interface VendorCategoryFormProps {
  editingVendorCategory?: any;
  onFormSubmit?: () => void;
  onCancel?: () => void;
}

const VendorCategoryForm: React.FC<VendorCategoryFormProps> = ({ editingVendorCategory, onFormSubmit, onCancel }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  // Use editingVendorCategory if provided, otherwise fall back to URL param
  const currentVendorCategory = editingVendorCategory || null;
  const isEmbedded = Boolean(onFormSubmit); // Check if component is embedded

  const { fetchVendorCategoryById, updateVendorCategory, addVendorCategory, getAllForms } = useVendorCategoryActions();
  const { selectedVendorCategory, formLoading: categoryLoading, error } = useVendorCategory();
  const [forms, setForms] = useState<FormType[]>([]);

  const methods = useForm<VendorCategorySchemaType>({
    resolver: zodResolver(vendorCategorySchema),
    mode: 'all',
    defaultValues: {
      name: '',
      description: '',
      formId: '',
    },
  });
   const { formState: { errors, isDirty }, control } = methods;

  const { reset } = methods;

  useEffect(() => {
    const load = async () => {
      if (id && !isEmbedded) {
        await fetchVendorCategoryById(id);
      }
      // Load forms for dropdown
      const formsData = await getAllForms();
      // Ensure formsData is always an array
      setForms(Array.isArray(formsData) ? formsData : []);
    };
    load();
  }, [id, isEmbedded]);

  const isEditMode = Boolean(id) || Boolean(currentVendorCategory);
  const vendorCategoryToEdit = isEmbedded ? currentVendorCategory : selectedVendorCategory;
  
  useEffect(() => {
    if (isEditMode && vendorCategoryToEdit) {
      reset({
        name: vendorCategoryToEdit.name,
        description: vendorCategoryToEdit.description,
        formId: vendorCategoryToEdit.formId || '',
      });
    } else {
      // Reset for create mode
      reset({
        name: '',
        description: '',
        formId: '',
      });
    }
  }, [vendorCategoryToEdit, isEditMode, reset, currentVendorCategory]);
  

  const onSubmit = async (data: VendorCategorySchemaType) => {
    try {
      if (isEditMode && (id || currentVendorCategory)) {
        const categoryId = id || currentVendorCategory?.id;
        await updateVendorCategory(categoryId, data.name, data.description || '', data.formId);
        if (!isEmbedded) {
          toast.success('Vendor Category updated successfully');
          navigate('/vendor-category-management');
        }
        // Don't navigate - stay on form for further edits
      } else {
        await addVendorCategory(data.name, data.description || '', data.formId);
        if (!isEmbedded) {
          toast.success('Vendor Category created successfully');
          navigate('/vendor-category-management');
        }
        // Reset form for next entry instead of navigating
        reset({
          name: '',
          description: '',
          formId: '',
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
    // <Layout></Layout>
      
      <>
             <Layout>
       <h2 className="text-xl font-semibold mb-2">{isEditMode ? 'Edit Vendor Category' : 'Create Vendor Category'}</h2>
       <Breadcrumbs/>
       <div className="text-gray-800 shadow-sm mt-5 max-w-3xl border  border-neutral-100 bg-white rounded-xl p-6">
           <div className='flex justify-between items-center mb-4'>  
             <h3 className="text-lg font-medium">{isEditMode ? 'Edit Vendor Category' : 'Create Vendor Category'}</h3>
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
           </div>
        <div className="grid grid-cols-1">
          <FormProvider {...methods}>
            <Form<VendorCategorySchemaType>
              mode="all"
              schema={vendorCategorySchema}
              onSubmit={onSubmit} className=' bg-white text-gray-800 '
            >
              <div className="grid grid-cols-1 md:grid-row-1 gap-4">
                <InputGroup
                  label="Vendor Category Name"
                  name="name"
                  id="name"
                  placeholder="Enter vendor category name"
                  autoComplete="vendor-category-name"
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
                 <Controller
                   name="formId"
                   control={control}
                   render={({ field, fieldState }) => {
                     const selectedOption = Array.isArray(forms) ? forms.find((form: FormType) => (form._id || form.id) === field.value) || null : null;
       
                     return (
                      
                         <SelectGroup
                           label="Select Form (Optional)"
                           options={Array.isArray(forms) ? forms.map((form: FormType) => ({
                             label: form.name,
                             value: form._id || form.id,
                           })) : []}
                           value={selectedOption ? [{
                             label: selectedOption.name,
                             value: selectedOption._id || selectedOption.id
                           }] : []}
                           onChange={(selected) => {
                             const value = Array.isArray(selected) ? selected[0]?.value : '';
                             field.onChange(value);
                           }}
                           isMulti={false}
                           error={fieldState.error?.message}
                         />
                      
                     );
                   }}
                 />
              </div>
              <div className="flex gap-4 pt-6">
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={categoryLoading || !canSubmit}
                >
                  {categoryLoading ? 'Saving...' : isEditMode ? 'Update Vendor Category' : 'Create Vendor Category'}
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

export default VendorCategoryForm;
