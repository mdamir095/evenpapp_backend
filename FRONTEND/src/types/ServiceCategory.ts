export interface ServiceCategory {
    id: string;
    key?: string;
    name: string;
    description?: string;
    formId?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface Form {
    id: string;
    _id: string;
    name: string;
    description?: string;
    type: string;
    categoryId: string;
    fields: any[];
    createdAt?: string;
    updatedAt?: string;
}