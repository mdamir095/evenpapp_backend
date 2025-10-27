export interface VendorCategory {
    id: string;
    key?: string;
    name: string;
    description?: string;
    isActive?: boolean;
    formId?: string;
    form?: {
        id: string;
        name: string;
        description?: string;
        type: string;
        fields: any[];
        createdAt?: string;
        updatedAt?: string;
    };
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
