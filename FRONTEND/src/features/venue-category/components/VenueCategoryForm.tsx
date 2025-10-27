import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Layout from '../../../layouts/Layout';
import { InputGroup } from '../../../components/molecules/InputGroup';
import { SelectGroup } from '../../../components/molecules/SelectGroup';
import { Button } from '../../../components/atoms/Button';
import { FormError } from '../../../components/atoms/FormError';

import { useToast } from '../../../components/atoms/Toast';
import { useCategory } from '../hooks/useCategory';
import { VenueCategorySchema, type VenueCategorySchemaType } from '../schemas/category.schema';
import { useCategoryActions } from '../hooks/useCategoryActions';
import { useFormsActions } from '../hooks/useFormsActions';
import type { Form as FormType } from '../../../types/form';
import Breadcrumbs from '../../../components/common/BreadCrumb';


const VenueCategoryForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [availableForms, setAvailableForms] = useState<FormType[]>([]);
  const formsLoadedRef = useRef(false);

  const { fetchCategoryById, updateCategory, addCategory } = useCategoryActions();
  const { selectedCategory, loading: categoryLoading, error } = useCategory();
  const { getFormsList } = useFormsActions();

  const methods = useForm<VenueCategorySchemaType>({
    resolver: zodResolver(VenueCategorySchema),
    defaultValues: {
      name: '',
      description: '',
      icon: '',
      formId: '',
      isActive: true
    },
  });
  const { formState: { errors }, control } = methods;

  const { reset } = methods;

  useEffect(() => {
    const load = async () => {
      try {
        if (id) {
          await fetchCategoryById(id);
        }
      } catch (error) {
        toast.error('Failed to load category data');
      }
    };
    load();
  }, [id]); // Remove function dependencies

  // Separate useEffect for loading forms - only runs once on mount
  useEffect(() => {
    const loadForms = async () => {
      if (formsLoadedRef.current) return; // Prevent multiple calls

      try {
        formsLoadedRef.current = true;
        const forms:any = await getFormsList();
        if(forms?.data){
          setAvailableForms(forms?.data);
        }
      } catch (error) {
        toast.error('Failed to load forms data');
        formsLoadedRef.current = false; // Reset on error to allow retry
      }
    };
    loadForms();
  }, []); // Empty dependency array - runs only once

  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode && selectedCategory) {
      reset({
        name: selectedCategory.name,
        description: selectedCategory.description,
        icon: selectedCategory.icon || '',
        formId: selectedCategory.formId,
        isActive: selectedCategory.isActive
      });
    }
  }, [selectedCategory, isEditMode, reset]);


  const onSubmit = async (data: VenueCategorySchemaType) => {
    try {
      if (id) {
        await updateCategory(id, data);
        toast.success('Category updated successfully');
      } else {
        await addCategory(data);
        toast.success('Category created successfully');
      }
      navigate('/venue-category-management');
    } catch (err) {
      toast.error('Something went wrong.');
    }
  };


  return (
    <Layout>
      <h2 className="text-xl font-semibold mb-2">{id ? 'Venue Category' : 'Venue Category'}</h2>
      <Breadcrumbs/>
      <div className="text-gray-800 shadow-sm mt-5 max-w-3xl border  border-neutral-100 bg-white rounded-xl p-6">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1  gap-4 ">
              <InputGroup
                label="Name"
                name="name"
                id="name"
                placeholder="Enter Category name"
                autoComplete="category-name"
                error={errors?.name?.message}
              />
              <InputGroup
                label="Description"
                name="description"
                id="description"
                placeholder="Enter venue category description"
                autoComplete="description"
                error={errors?.description?.message}
              />
                           <Controller
                name="formId"
                control={control}
                render={({ field, fieldState }) => {
                  const selectedOption = (Array.isArray(availableForms) ? availableForms : [])
                    .find((form: FormType) => form?.id === field?.value) || null;
                  return (
                    <div className="col-span-1">
                      <SelectGroup
                        label="Select Form"
                        options={(Array.isArray(availableForms) ? availableForms : []).map(
                          (form: FormType) => ({
                            label: form.name,
                            value: form.id,
                          })
                        )}
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
            <div className="flex gap-4 pt-6">
              <Button type="submit" variant="primary" disabled={categoryLoading}>
                {categoryLoading ? 'Saving...' : id ? 'Update Category' : 'Create Category'}
              </Button>
              <Button
                type="button"
                variant="muted"
                onClick={() => navigate('/venue-category-management')}
              >
                Cancel
              </Button>
            </div>
            {error && <FormError message={error} />}
          </form>
        </FormProvider>
      </div>
    </Layout>
  );
};

export default VenueCategoryForm;


