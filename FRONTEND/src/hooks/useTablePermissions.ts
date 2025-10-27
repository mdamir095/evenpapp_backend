import { useMemo } from 'react';
import { getFeaturePermissions, getFeaturePermissionsByUniqueId, getUserDataFromStorage } from '../utils/permissions';

interface TablePermissions {
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canResetPassword: boolean;
}

interface UseTablePermissionsProps {
  featureName?: string;
  uniqueId?: string;
  showResetPasswordOption?: boolean;
}

export const useTablePermissions = ({
  featureName,
  uniqueId,
  showResetPasswordOption = false,
}: UseTablePermissionsProps): TablePermissions => {
  return useMemo(() => {
    // Default permissions when no feature identifier is provided
    if (!featureName && !uniqueId) {
      return {
        canAdd: true,
        canEdit: true,
        canDelete: true,
        canResetPassword: showResetPasswordOption,
      };
    }

    // Use the centralized permission system with Super Admin support
    const userData = getUserDataFromStorage();
    
    // Prefer uniqueId over featureName for better consistency
    const permissions = uniqueId 
      ? getFeaturePermissionsByUniqueId(userData, uniqueId)
      : getFeaturePermissions(userData, featureName!);

    return {
      canAdd: permissions.canAdd,
      canEdit: permissions.canEdit,
      canDelete: permissions.canDelete,
      canResetPassword: permissions.canResetPassword && showResetPasswordOption,
    };
  }, [featureName, uniqueId, showResetPasswordOption]);
};