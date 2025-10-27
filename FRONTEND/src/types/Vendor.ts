export interface Vendor {
    id?: string;
    name: string;
    description?: string;
    serviceCategoryId?: string; // Changed from categoryId to serviceCategoryId
    vendorCategoryId?: string;
    vendorCategory?: {
        id: string;
        name: string;
        description?: string;
        formId?: string;
        form?: {
            id: string;
            name: string;
            description?: string;
            type: string;
            fields: any[];
        };
    };
    dynamicFormData?: Record<string, any>;
    formData?: {
        _id?: string;
        name?: string;
        description?: string;
        categoryId?: string;
        type?: string;
        fields?: DynamicFormField[];
        key?: string;
        isActive?: boolean;
        isDeleted?: boolean;
        createdBy?: string;
        updatedBy?: string;
        createdAt?: string;
        updatedAt?: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

export interface VendorFormData {
  name: string;
  description?: string;
  serviceCategoryId: string; // Changed from categoryId to serviceCategoryId
  formId?: string; // Add formId parameter
  formData?: any;
}

export interface ServiceCategoryOption {
    label: string;
    value: string;
}

export interface DynamicFormField {
    id: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'number' | 'email' | 'date' | 'dropdown' | 'button' | 'button-group' | 'date-range' | 'multi-select' | 'location' | 'MultiImageUpload';
    required?: boolean;
    placeholder?: string;
    options?: { label: string; value: string }[];
    metadata?: {
        label?: string;
        placeholder?: string;
        tooltip?: string;
        options?: string[];
        icon?: string;
        defaultValue?: any;
    };
    validation?: {
        required?: { value: boolean; message: string };
        min?: { value: number; message: string };
        max?: { value: number; message: string };
        regex?: { value: string; message: string };
        invalidType?: { value: string; message: string };
    };
    key?: string;
    name?: string;
    order?: number;
    actualValue?: any;
}

export interface DynamicForm {
  id: string;
  formId?: string; // Add formId from the API response
  name: string;
  description?: string;
  key?: string;
  createdAt?: string;
  updatedAt?: string;
  fields: DynamicFormField[];
}