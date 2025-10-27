import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputGroup } from '../../../components/molecules/InputGroup';
import { Button } from '../../../components/atoms/Button';
import { FormError } from '../../../components/atoms/FormError';
import { Form } from '../../../components/common/Form';
import { useToast } from '../../../components/atoms/Toast';
import { serviceCategorySchema, type ServiceCategorySchemaType } from '../schemas/serviceCategory.schema';
import { useServiceCategory } from '../hooks/useServiceCategory';
import { useServiceCategoryActions } from '../hooks/useServiceCategoryActions';
import { SelectGroup } from '../../../components/molecules/SelectGroup';
import Layout from '../../../layouts/Layout';
import Breadcrumbs from '../../../components/common/BreadCrumb';

interface ServiceCategoryFormProps {
  editingServiceCategory?: any;
  onFormSubmit?: () => void;
  onCancel?: () => void;
}

const CategoryForm: React.FC<ServiceCategoryFormProps> = ({ editingServiceCategory, onFormSubmit, onCancel }) => {
  const { id } = useParams();

  const toast = useToast();

  // Use editingServiceCategory if provided, otherwise fall back to URL param
  const currentServiceCategory = editingServiceCategory || null;
  const isEmbedded = Boolean(onFormSubmit); // Check if component is embedded
  const navigate = useNavigate();

  const { fetchCategoryById, updateCategory, addCategory, getFormsList } = useServiceCategoryActions();
  const { selectedCategory, formLoading: categoryLoading, error } = useServiceCategory();
  
  const [forms, setForms] = useState<any[]>([]);

  const methods = useForm<ServiceCategorySchemaType>({
    resolver: zodResolver(serviceCategorySchema),
    mode: 'all',
    defaultValues: {
      name: '',
      description: '',
      formId: '',
    },
  });
   const { formState: { errors, isDirty } } = methods;

  const { reset, watch } = methods;
  
  // Watch form values in real-time for debugging
  const watchedValues = watch();
  console.log('=== WATCHED FORM VALUES ===');
  console.log('All watched values:', watchedValues);
  console.log('formId watched value:', watchedValues.formId);
  console.log('================================');

  useEffect(() => {
    const load = async () => {
      if (id && !isEmbedded) {
        await fetchCategoryById(id);
      }
      // Fetch forms for dropdown
      const formsList = await getFormsList();
      console.log('Fetched forms:', formsList); // Debug log
      setForms(formsList);
    };
    load();
  }, [id, isEmbedded, fetchCategoryById, getFormsList]);

  const isEditMode = Boolean(id) || Boolean(currentServiceCategory);
  const serviceCategoryToEdit = isEmbedded ? currentServiceCategory : selectedCategory;
  
  useEffect(() => {
    if (isEditMode && serviceCategoryToEdit) {
      console.log('=== EDITING CATEGORY DEBUG ===');
      console.log('Editing category data:', serviceCategoryToEdit);
      console.log('formId from API:', serviceCategoryToEdit.formId);
      console.log('formId type:', typeof serviceCategoryToEdit.formId);
      console.log('formId length:', serviceCategoryToEdit.formId?.length);
      console.log('================================');
      
      reset({
        name: serviceCategoryToEdit.name,
        description: serviceCategoryToEdit.description,
        formId: serviceCategoryToEdit.formId || '',
      });
    } else {
      // Reset for create mode
      reset({
        name: '',
        description: '',
        formId: '',
      });
    }
  }, [serviceCategoryToEdit, isEditMode, reset, currentServiceCategory]);
  

  const onSubmit = async (data: ServiceCategorySchemaType) => {
    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('Form submission data:', data);
    console.log('Form ID value:', data.formId);
    console.log('Form ID type:', typeof data.formId);
    console.log('Form ID length:', data.formId?.length);
    console.log('Is formId empty string?', data.formId === '');
    console.log('Is formId null?', data.formId === null);
    console.log('Is formId undefined?', data.formId === undefined);
    console.log('================================');
    
    try {
      if (isEditMode && (id || currentServiceCategory)) {
        const categoryId = id || currentServiceCategory?.id;
        console.log('Updating category with formId:', data.formId);
        await updateCategory(categoryId, data.name, data.description || '', data.formId || '');
        if (!isEmbedded) {
          toast.success('Category updated successfully');
          navigate('/service-category');
        }
        // Don't navigate - stay on form for further edits
      } else {
        console.log('Creating category with formId:', data.formId);
        await addCategory(data.name, data.description || '', data.formId || '');
        if (!isEmbedded) {
          toast.success('Category created successfully');
          navigate('/service-category');
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
      console.error('Form submission error:', err);
      // The error is already handled by Redux actions and will be displayed via the FormError component
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
      <>
      <Layout>
        <h2 className="text-xl font-semibold mb-2">{id ? 'Edit Service Category' : 'Create Service Category'}</h2>
        <Breadcrumbs/>
        <div className="text-gray-800 shadow-sm mt-5 max-w-3xl border  border-neutral-100 bg-white rounded-xl p-6">
            {/* <div className='flex justify-between items-center'>  
              <h2 className="text-xl font-semibold">{isEditMode ? 'Edit Service Category' : 'Create Service Category'}</h2>
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
                  + Add New Instead
                </Button>
              )}
            </div> */}
          <div className="grid grid-cols-1">
            <FormProvider {...methods}>
              <Form<ServiceCategorySchemaType>
                mode="all"
                schema={serviceCategorySchema}
                onSubmit={onSubmit} className=' bg-white text-gray-800 '
              >
                <div className="grid grid-cols-1 md:grid-row-1 gap-4">
                  <InputGroup
                    label="Category Name"
                    name="name"
                    id="name"
                    placeholder="Enter category name"
                    autoComplete="category-name"
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
                                 <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                   <Controller
                     name="formId"
                     control={methods.control}
                     render={({ field, fieldState }) => {
                       console.log('=== FORM FIELD DEBUG ===');
                       console.log('Form field value:', field.value);
                       console.log('Form field name:', field.name);
                       console.log('Form field onChange:', field.onChange);
                       console.log('Available forms:', forms);
                       console.log('Forms length:', forms.length);
                       
                       // Handle both id and _id fields from forms API
                       const selectedForm = forms.find(form => 
                         form.id === field.value || form._id === field.value
                       );
                       console.log('Selected form:', selectedForm);
                       console.log('================================');
                       
                       return (
                         <SelectGroup
                           label="Form Builder"
                           options={[
                             { label: 'Select a form (optional)', value: '' },
                             ...forms.map(form => ({
                               label: form.name || 'Unnamed Form',
                               value: form.id || form._id,
                             }))
                           ]}
                           value={selectedForm ? [{
                             label: selectedForm.name || 'Unnamed Form',
                             value: selectedForm.id || selectedForm._id
                           }] : []}
                           onChange={(selected) => {
                             const value = Array.isArray(selected) ? selected[0]?.value : '';
                             console.log('Selected form value:', value); // Debug log
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
                    {categoryLoading ? 'Saving...' : isEditMode ? 'Update Service Category' : 'Create Service Category'}
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

export default CategoryForm;
