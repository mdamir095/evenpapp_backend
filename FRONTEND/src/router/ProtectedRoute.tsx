import React from 'react';
import RequireAuth from './RequireAuth';
import PermissionGuard from './PermissionGuard';

/**
 * Combined Protected Route Component
 * 
 * This component combines authentication and permission checks for easier route protection.
 * It first checks authentication, then validates feature permissions.
 */

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredFeature?: string;
  requiredPermission?: 'read' | 'write' | 'admin';
  allowSuperAdminBypass?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredFeature,
  requiredPermission = 'read',
  allowSuperAdminBypass = true
}) => {
  return (
    <RequireAuth>
      <PermissionGuard
        requiredFeature={requiredFeature}
        requiredPermission={requiredPermission}
        allowSuperAdminBypass={allowSuperAdminBypass}
      >
        {children}
      </PermissionGuard>
    </RequireAuth>
  );
};

export default ProtectedRoute;