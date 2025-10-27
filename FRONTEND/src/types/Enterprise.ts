export interface Enterprise {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    enterpriseName: string; 
    description: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    countryCode: string;
    phoneNumber: string;
    featureIds: string[];
    features?: EnterpriseFeature[];
    isActive: boolean;
    isEmailVerified: boolean;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface EnterpriseFeature {
    featureId: string;
    permissions: {
      read: boolean;
      write: boolean;
      admin: boolean;
    };
  }