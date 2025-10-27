import { createContext, useContext, type ReactNode } from 'react';

// -----------------------------
// Types
// -----------------------------

export type Permission = {
  Write?: boolean;
  read?: boolean;
  admin?: boolean;
};

export type Feature = {
  id: string;
  name: string;
  permission: Permission;
};

export type Role = {
  id: string;
  name: string;
  features: Feature[];
};

interface PermissionContextType {
  getPermission: (featureName: string) => Permission | undefined;
  hasPermission: (featureName: string, type: keyof Permission) => boolean;
}

// -----------------------------
// Context
// -----------------------------

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

// -----------------------------
// Provider
// -----------------------------

export const PermissionProvider = ({
  children,
  roles,
}: {
  children: ReactNode;
  roles: Role[];
}) => {
  const featurePermissions: Record<string, Permission> = {};

  roles?.forEach((role) => {
    role.features?.forEach((feature) => {
      const existing = featurePermissions[feature.name] || {};
      const incoming = feature.permission || {};
      featurePermissions[feature.name] = {
        Write: existing.Write || incoming.Write,
        read: existing.read || incoming.read,
        admin: existing.admin || incoming.admin,
      };
    });
  });

  const getPermission = (featureName: string): Permission | undefined => {
    return featurePermissions[featureName];
  };

  const hasPermission = (
    featureName: string,
    type: keyof Permission
  ): boolean => {
    return featurePermissions[featureName]?.[type] ?? false;
  };

  return (
    <PermissionContext.Provider value={{ getPermission, hasPermission }}>
      {children}
    </PermissionContext.Provider>
  );
};

// -----------------------------
// Hook
// -----------------------------

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};
