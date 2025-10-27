export interface UserRole {
  name: string;
  features?: Array<{
    id: string;
    name: string;
    uniqueId: string;
    permission?: {
      read?: boolean;
      write?: boolean;
      admin?: boolean;
    };
  }>;
}

export interface UserData {
  roles?: UserRole[];
  enterpriseId?: string;
  organizationName?: string;
}

/**
 * Check if user has Super Admin role
 */
/**
 * Check if user is Super Admin (NOT regular Admin)
 * 
 * System has 2 roles:
 * - "Super Admin" / "SUPER_ADMIN" = Full access to all modules (bypass permissions)
 * - "Admin" / "ADMIN" = Standard permissions-based access
 */
export const isSuperAdmin = (userData: UserData | null): boolean => {
  if (!userData?.roles || !Array.isArray(userData.roles)) {
    return false;
  }

  return userData.roles.some((role: UserRole) => {
    const roleName = role.name?.toLowerCase().trim();
    return (
      // Exact Super Admin matches ONLY
      roleName === 'super admin' ||
      roleName === 'super_admin' ||
      roleName === 'superadmin' ||
      roleName === 'super-admin' ||
      roleName === 'super'
      // Removed broad condition that was matching any role with "super" and "admin"
    );
  });
};

/**
 * Check if user is regular Admin (NOT Super Admin)
 */
export const isRegularAdmin = (userData: UserData | null): boolean => {
  if (!userData?.roles || !Array.isArray(userData.roles)) {
    return false;
  }

  return userData.roles.some((role: UserRole) => {
    const roleName = role.name?.toLowerCase().trim();
    return (
      // Only exact "admin" matches, not "super admin"
      roleName === 'admin' && !roleName.includes('super')
    );
  });
};

/**
 * Get all Super Admin role names for verification
 */
export const getSuperAdminRoles = (userData: UserData | null): string[] => {
  if (!userData?.roles || !Array.isArray(userData.roles)) {
    return [];
  }

  return userData.roles
    .filter((role: UserRole) => {
      const roleName = role.name?.toLowerCase().trim();
      return (
        roleName === 'super admin' ||
        roleName === 'super_admin' ||
        roleName === 'superadmin' ||
        roleName === 'super-admin' ||
        roleName === 'super' ||
        (roleName.includes('super') && roleName.includes('admin'))
      );
    })
    .map((role: UserRole) => role.name);
};

/**
 * Get user role classification for debugging and display
 */
export const getUserRoleInfo = (userData: UserData | null): {
  isSuperAdmin: boolean;
  isRegularAdmin: boolean;
  allRoles: string[];
  accessLevel: 'Super Admin' | 'Admin' | 'User' | 'Unknown';
} => {
  const allRoles = userData?.roles?.map(role => role.name) || [];
  const isSuperAdminUser = isSuperAdmin(userData);
  const isRegularAdminUser = isRegularAdmin(userData);
  
  let accessLevel: 'Super Admin' | 'Admin' | 'User' | 'Unknown';
  if (isSuperAdminUser) {
    accessLevel = 'Super Admin';
  } else if (isRegularAdminUser) {
    accessLevel = 'Admin';
  } else if (allRoles.length > 0) {
    accessLevel = 'User';
  } else {
    accessLevel = 'Unknown';
  }

  return {
    isSuperAdmin: isSuperAdminUser,
    isRegularAdmin: isRegularAdminUser,
    allRoles,
    accessLevel
  };
};

/**
 * Get user permissions for a specific feature by name or uniqueId
 */
export const getFeaturePermissions = (
  userData: UserData | null,
  featureNameOrUniqueId: string
): {
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canView: boolean;
  canResetPassword: boolean;
  hasAccess: boolean;
} => {
  // If Super Admin, grant all permissions
  if (isSuperAdmin(userData)) {
    return {
      canAdd: true,
      canEdit: true,
      canDelete: true,
      canView: true,
      canResetPassword: true,
      hasAccess: true,
    };
  }

  // For regular users, check feature-specific permissions
  try {
    const roles = Array.isArray(userData?.roles) ? userData.roles : [];
    const matchedFeature = roles
      .flatMap((r: UserRole) => r.features || [])
      .find((f: any) => f.name === featureNameOrUniqueId || f.uniqueId === featureNameOrUniqueId);

    const hasRead = !!matchedFeature?.permission?.read;
    const hasWrite = !!matchedFeature?.permission?.write;
    const hasAdmin = !!matchedFeature?.permission?.admin;

    // If all permissions are false, module should not be accessible
    const hasAnyPermission = hasRead || hasWrite || hasAdmin;

    return {
      canAdd: hasWrite || hasAdmin,
      canEdit: hasWrite || hasAdmin,
      canDelete: hasAdmin,
      canView: hasRead || hasWrite || hasAdmin,
      canResetPassword: hasWrite || hasAdmin,
      hasAccess: hasAnyPermission,
    };
  } catch (err) {
    return {
      canAdd: false,
      canEdit: false,
      canDelete: false,
      canView: false,
      canResetPassword: false,
      hasAccess: false,
    };
  }
};

/**
 * Get user permissions by uniqueId specifically (new function)
 */
export const getFeaturePermissionsByUniqueId = (
  userData: UserData | null,
  uniqueId: string
): {
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canView: boolean;
  canResetPassword: boolean;
  hasAccess: boolean;
} => {
  // If Super Admin, grant all permissions
  if (isSuperAdmin(userData)) {
    return {
      canAdd: true,
      canEdit: true,
      canDelete: true,
      canView: true,
      canResetPassword: true,
      hasAccess: true,
    };
  }

  // For regular users, check feature-specific permissions by uniqueId
  try {
    const roles = Array.isArray(userData?.roles) ? userData.roles : [];
    const matchedFeature = roles
      .flatMap((r: UserRole) => r.features || [])
      .find((f: any) => f.uniqueId === uniqueId);

    const hasRead = !!matchedFeature?.permission?.read;
    const hasWrite = !!matchedFeature?.permission?.write;
    const hasAdmin = !!matchedFeature?.permission?.admin;

    // If all permissions are false, module should not be accessible
    const hasAnyPermission = hasRead || hasWrite || hasAdmin;

    return {
      canAdd: hasWrite || hasAdmin,
      canEdit: hasWrite || hasAdmin,
      canDelete: hasAdmin,
      canView: hasRead || hasWrite || hasAdmin,
      canResetPassword: hasWrite || hasAdmin,
      hasAccess: hasAnyPermission,
    };
  } catch (err) {
    return {
      canAdd: false,
      canEdit: false,
      canDelete: false,
      canView: false,
      canResetPassword: false,
      hasAccess: false,
    };
  }
};

/**
 * Get all accessible features for user
 */
export const getAccessibleFeatures = (userData: UserData | null): string[] => {
  // If Super Admin, return all possible features
  if (isSuperAdmin(userData)) {
    return [
      'Dashboard',
      'User Management',
      'Role Management',
      'Feature Management',
      'Enterprise Management',
      'Form Builder',
      'Venue Category',
      'Venue Management',
      'Profile Setting',
      'Service Category',
      'Vendor Category',
      'Vendor Management',
    ];
  }

  // For regular users, filter based on permissions
  const featureNames: string[] =
    userData?.roles?.flatMap((role: UserRole) =>
      role?.features
        ?.filter(
          (feature: any) =>
            feature?.permission?.read ||
            feature?.permission?.write ||
            feature?.permission?.admin
        )
        .map((feature: any) => feature.name)
    ) ?? [];

  return featureNames;
};

/**
 * Get user data from localStorage
 */
export const getUserDataFromStorage = (): UserData | null => {
  try {
    const userString = localStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  } catch (error) {
    // Failed to parse user from localStorage
    return null;
  }
};
