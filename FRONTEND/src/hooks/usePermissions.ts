import { useMemo } from 'react';
import { 
  isSuperAdmin, 
  getFeaturePermissions, 
  getFeaturePermissionsByUniqueId,
  getAccessibleFeatures, 
  getUserDataFromStorage 
} from '../utils/permissions';

/**
 * Custom hook for permission management
 */
export const usePermissions = (featureName?: string) => {
  const permissions = useMemo(() => {
    const userData = getUserDataFromStorage();
    const isSuper = isSuperAdmin(userData);
    const accessibleFeatures = getAccessibleFeatures(userData);
    
    if (featureName) {
      const featurePerms = getFeaturePermissions(userData, featureName);
      return {
        isSuperAdmin: isSuper,
        accessibleFeatures,
        ...featurePerms,
      };
    }
    
    return {
      isSuperAdmin: isSuper,
      accessibleFeatures,
      canAdd: false,
      canEdit: false,
      canDelete: false,
      canView: false,
      canResetPassword: false,
      hasAccess: false,
    };
  }, [featureName]);

  return permissions;
};

/**
 * Custom hook for permission management using uniqueId (recommended)
 */
export const usePermissionsByUniqueId = (uniqueId?: string) => {
  const permissions = useMemo(() => {
    const userData = getUserDataFromStorage();
    const isSuper = isSuperAdmin(userData);
    const accessibleFeatures = getAccessibleFeatures(userData);
    
    if (uniqueId) {
      const featurePerms = getFeaturePermissionsByUniqueId(userData, uniqueId);
      return {
        isSuperAdmin: isSuper,
        accessibleFeatures,
        ...featurePerms,
      };
    }
    
    return {
      isSuperAdmin: isSuper,
      accessibleFeatures,
      canAdd: false,
      canEdit: false,
      canDelete: false,
      canView: false,
      canResetPassword: false,
      hasAccess: false,
    };
  }, [uniqueId]);

  return permissions;
};

/**
 * Hook specifically for checking if current user is Super Admin
 */
export const useSuperAdmin = () => {
  return useMemo(() => {
    const userData = getUserDataFromStorage();
    return isSuperAdmin(userData);
  }, []);
};
