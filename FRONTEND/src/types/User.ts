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

export interface Role {
  id: string;
  name: string;
  featurePermissions: FeaturePermission[];
}

// User model used across User Management
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  organizationName: string;
  countryCode: string;
  phoneNumber: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  roleIds: string[];
  features?: FeaturePermission[]; // ✅ Added features (optional for backward compatibility)
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Feature {
  id: string;
  name: string;
  isActive: boolean;
}

