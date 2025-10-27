import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { usePermissionsByUniqueId } from '../hooks/usePermissions';
import { getUserDataFromStorage, getUserRoleInfo } from '../utils/permissions';

/**
 * Permission-based Route Guard
 * 
 * This component protects routes based on user permissions and module access.
 * Features:
 * - Checks authentication status
 * - Validates user permissions for specific features/modules
 * - Super Admin bypass (full access to all modules)
 * - Unauthorized access handling
 * - Direct URL access protection
 */

interface PermissionGuardProps {
  children: React.ReactElement;
  requiredFeature?: string; // Feature name required to access this route
  requiredPermission?: 'read' | 'write' | 'admin'; // Specific permission level required
  allowSuperAdminBypass?: boolean; // Whether Super Admin can bypass restrictions (default: true)
}

// Route to feature mapping for URL-based permission checking (using uniqueId)
const ROUTE_FEATURE_MAPPING: Record<string, string> = {
  '/user-management': 'user_management',
  '/employee-management': 'employee_management',
  '/role-management': 'role_management', 
  '/feature-management': 'feature_management',
  '/enterprise-management': 'enterprise_management',
  '/form-list': 'form_builder',
  '/form-builder': 'form_builder',
  '/venue-management': 'venue_management',
  '/category-management': 'service_category',
  '/service-category': 'service_category',
  '/vendor-management': 'vendor_management',
  '/content-policy': 'content_policy',
  '/booking-management': 'booking_management',
};

// Routes that are universally accessible to all authenticated users
const UNIVERSAL_ROUTES = [
  '/dashboard',
  '/profile-setting',
  '/logout'
];

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredFeature,
  requiredPermission = 'read',
  allowSuperAdminBypass = true
}) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const userData = getUserDataFromStorage();

  // First check: Authentication required
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Second check: Universal routes (accessible to all authenticated users)
  if (UNIVERSAL_ROUTES.includes(location.pathname)) {
    return children;
  }

  // Third check: Super Admin bypass
  const userRoleInfo = getUserRoleInfo(userData);
  
  if (allowSuperAdminBypass && userRoleInfo.isSuperAdmin) {
    // Super Admin has access to ALL modules regardless of specific permissions
    return children;
  }
  
  // Log regular admin access attempts for clarity
  if (userRoleInfo.isRegularAdmin) {
    // Regular Admin access - checking permissions
  }

  // Fourth check: Determine required feature from route or prop
  const featureToCheck = requiredFeature || ROUTE_FEATURE_MAPPING[location.pathname];
  
  if (!featureToCheck) {
    // Route not in mapping and no explicit feature required - allow access
    // This handles dynamic routes and edge cases
    return children;
  }

  // Fifth check: Feature-specific permission validation using uniqueId
  const permissions = usePermissionsByUniqueId(featureToCheck);

  // Check if user has the required permission level
  let hasAccess = false;
  
  switch (requiredPermission) {
    case 'admin':
      hasAccess = permissions.canDelete; // Admin level includes delete permissions
      break;
    case 'write':
      hasAccess = permissions.canEdit || permissions.canAdd; // Write level includes edit/add
      break;
    case 'read':
    default:
      hasAccess = permissions.canView; // Read level is minimum access
      break;
  }

  // Permission check completed

  // Fifth check: Check if user has any access to the feature at all
  if (!permissions.hasAccess) {
    // User has no access to this feature (all permissions are false)
    return <Navigate to="/unauthorized" state={{ 
      error: `You don't have access to ${featureToCheck}`,
      from: location 
    }} replace />;
  }

  // Sixth check: Final access decision based on required permission level
  if (!hasAccess) {
    // User has access to feature but not the required permission level
    return <Navigate to="/unauthorized" state={{ 
      error: `You don't have sufficient permissions for ${featureToCheck}`,
      from: location 
    }} replace />;
  }

  // All checks passed - grant access
  return children;
};

/**
 * Higher-order component for easy route protection
 */
export const withPermissionGuard = (
  Component: React.ComponentType,
  requiredFeature?: string,
  requiredPermission?: 'read' | 'write' | 'admin'
) => {
  return (props: any) => (
    <PermissionGuard 
      requiredFeature={requiredFeature}
      requiredPermission={requiredPermission}
    >
      <Component {...props} />
    </PermissionGuard>
  );
};

export default PermissionGuard;
