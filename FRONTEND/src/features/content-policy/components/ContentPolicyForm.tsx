import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputGroup } from '../../../components/molecules/InputGroup';
import { SelectGroup } from '../../../components/molecules/SelectGroup';
import { Button } from '../../../components/atoms/Button';
import { FormError } from '../../../components/atoms/FormError';
import { Form } from '../../../components/common/Form';
import { useToast } from '../../../components/atoms/Toast';
import RichTextEditor from '../../../components/common/RichTextEditor';
import { contentPolicySchema, type ContentPolicySchemaType } from '../schemas/contentPolicy.schema';
import { useContentPolicy } from '../hooks/useContentPolicy';
import { useContentPolicyActions } from '../hooks/useContentPolicyActions';
import Layout from '../../../layouts/Layout';
import Breadcrumbs from '../../../components/common/BreadCrumb';

interface ContentPolicyFormProps {
  editingContentPolicy?: any;
  onFormSubmit?: () => void;
  onCancel?: () => void;
}

const ContentPolicyForm: React.FC<ContentPolicyFormProps> = ({ 
  editingContentPolicy, 
  onFormSubmit, 
  onCancel 
}) => {
  const { id } = useParams();
  const toast = useToast();
  const [categories, setCategories] = useState<Array<{ key: string; value: string }>>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const navigate = useNavigate();

  const currentContentPolicy = editingContentPolicy || null;
  const isEmbedded = Boolean(onFormSubmit);

  const { 
    fetchContentPolicyById, 
    updateContentPolicy, 
    addContentPolicy,
    fetchCategories 
  } = useContentPolicyActions();
  const { selectedContentPolicy, formLoading: contentPolicyLoading, error } = useContentPolicy();

  const methods = useForm<ContentPolicySchemaType>({
    resolver: zodResolver(contentPolicySchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      title: '',
      content: '',
      effectiveDate: '',
      category: '',
    },
  });

  const { formState: { errors }, reset, watch, setValue, control, trigger } = methods;

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const fetched = await fetchCategories();
        setCategories(fetched);
      } catch (error) {
        setCategories([
          { key: 'privacy-policy', value: 'Privacy Policy' },
          { key: 'terms-of-service', value: 'Terms of Service' },
          { key: 'cookie-policy', value: 'Cookie Policy' },
          { key: 'data-protection', value: 'Data Protection' },
          { key: 'user-agreement', value: 'User Agreement' },
          { key: 'about-us', value: 'About Us' },
        ]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const load = async () => {
      if (id && !isEmbedded) {
        await fetchContentPolicyById(id);
      }
    };
    load();
  }, [id, isEmbedded, fetchContentPolicyById]);

  const isEditMode = Boolean(id) || Boolean(currentContentPolicy);
  const contentPolicyToEdit = isEmbedded ? currentContentPolicy : selectedContentPolicy;
  
  useEffect(() => {
    if (isEditMode && contentPolicyToEdit) {
      reset({
        title: contentPolicyToEdit.title || '',
        content: contentPolicyToEdit.content || '',
        // Ensure yyyy-MM-dd for date input
        effectiveDate: contentPolicyToEdit.effectiveDate ? new Date(contentPolicyToEdit.effectiveDate).toISOString().slice(0,10) : '',
        category: contentPolicyToEdit.category || '',
      });
    } else {
      reset({
        title: '',
        content: '',
        effectiveDate: '',
        category: '',
      });
    }
  }, [contentPolicyToEdit, isEditMode, reset, currentContentPolicy]);

  const onSubmit = async (data: ContentPolicySchemaType) => {
    try {
      if (isEditMode && (id || currentContentPolicy)) {
        const policyId = id || currentContentPolicy?.id;
        await updateContentPolicy(
          policyId, 
          data.title, 
          data.content, 
          data.effectiveDate, 
          data.category
        );
        if (!isEmbedded) {
          toast.success('Content Policy updated successfully');
          navigate('/content-policy');
        }
      } else {
        await addContentPolicy(
          data.title, 
          data.content, 
          data.effectiveDate, 
          data.category
        );
        if (!isEmbedded) {
          toast.success('Content Policy created successfully');
          navigate('/content-policy');
        }
        reset({ title: '', content: '', effectiveDate: '', category: '' });
      }
      if (isEmbedded && onFormSubmit) onFormSubmit();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to save content policy';
      if (!isEmbedded) toast.error(errorMessage);
    }
  };

  // Reactively watch fields
  const [title, content, category, effectiveDate] = useWatch({ control, name: ['title','content','category','effectiveDate'] });

  const canSubmit = useMemo(() => {
    const hasTitle = (title || '').trim().length > 0;
    const contentText = (content || '').replace(/<[^>]*>/g, '').trim();
    const hasContent = contentText.length > 0;
    const hasCategory = (category || '').trim().length > 0;
    const hasEffectiveDate = (effectiveDate || '').trim().length > 0;
    return hasTitle && hasContent && hasCategory && hasEffectiveDate;
  }, [title, content, category, effectiveDate]);

  return (
    <>
    <Layout>
    <h2 className="text-xl font-semibold mb-2">{id ? 'Edit Content Policy' : 'Create Content Policy'}</h2>
    <Breadcrumbs/>
    <div className="text-gray-800 shadow-sm mt-5 max-w-3xl border  border-neutral-100 bg-white rounded-xl p-6">
      <div className="grid grid-cols-1">
        <FormProvider {...methods}>
          <Form<ContentPolicySchemaType>
            mode="onSubmit"
            schema={contentPolicySchema}
            onSubmit={onSubmit} 
            className='bg-white text-gray-800'
          >
            {/* Row 1: Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup
                label="Policy Title"
                name="title"
                id="title"
                placeholder="Enter policy title"
                autoComplete="policy-title"
                error={errors?.title?.message}
              />
              <Controller
                name="category"
                control={control}
                render={({ field, fieldState }) => {
                  const selectedOption = categories?.find((c) => c.key === field.value) || null;
                  return (
                    <SelectGroup
                      label="Category"
                      options={categories?.map((c) => ({ label: c.value, value: c.key })) || []}
                      value={selectedOption ? [{ label: selectedOption.value, value: selectedOption.key }] : []}
                      onChange={(selected) => {
                        const value = Array.isArray(selected) ? selected[0]?.value || '' : '';
                        field.onChange(value);
                        trigger(['category']);
                      }}
                      isMulti={false}
                      error={fieldState.error?.message}
                    />
                  );
                }}
              />
            </div>

            {/* Row 2: Effective Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <InputGroup
                label="Effective Date"
                name="effectiveDate"
                id="effectiveDate"
                type="date"
                placeholder="Select effective date"
                error={errors?.effectiveDate?.message}
              />
            </div>

            {/* Policy Content */}
            <div className="flex flex-col mt-3">
              <label htmlFor="content" className="font-semibold text-gray-800 text-sm mb-2">
                Policy Content
              </label>
              <RichTextEditor
                value={content || ''}
                onChange={(value) => {
                  const cleanValue = value.trim();
                  setValue('content', cleanValue, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                }}
                placeholder="Enter the content policy details..."
                error={errors?.content?.message}
                disabled={contentPolicyLoading}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <Button 
                type="submit" 
                variant="primary" 
                disabled={contentPolicyLoading || !canSubmit}
              >
                {contentPolicyLoading ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
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

export default ContentPolicyForm;