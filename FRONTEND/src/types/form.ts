export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'email' | 'number' | 'dropdown' | 'date' | 'toggle' | 'button' | 'button-group' | 'date-range' | 'multi-select' | 'MultiImageUpload' | 'Address';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  metadata?:any,
  validation?:any,
  order?:number
}

export interface FormData {
  title: string;
  description?: string;
  fields: FormField[];
}

export interface DragItem {
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'email' | 'number' | 'dropdown' | 'date' | 'toggle' | 'button' | 'button-group' | 'date-range' | 'multi-select' | 'MultiImageUpload' | 'Address';
  label: string;
  // icon: string;
}

export interface Form {
  id: string;
  name: string;
  description?: string;
  formId: string;
  type?: string;
  createdAt: string;
  updatedAt: string;
}