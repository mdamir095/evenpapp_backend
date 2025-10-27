// Available permission types
export type Permission = 'read' | 'write' | 'admin';

export interface FeaturePermission {
  featureId: string;
  permissions: {
    read?: boolean;
    write?: boolean;
    admin?: boolean;
  };
}

// Employee model used across Employee Management
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  enterpriseId?: string;
  enterpriseName?: string;
  organizationName: string;
  countryCode: string;
  phoneNumber: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  features?: FeaturePermission[];
  password?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Feature {
  id: string;
  name: string;
  isActive: boolean;
}
