import {
  Home,
  FolderPen,
  Settings,
  BadgeCheck,
  Building2,
  UserCog,
  FolderTree,
  LayoutGrid,
  Package,
  ShoppingBag,
  UserLockIcon,
  IdCardLanyard,
  UsersRound,
  FileText,
  Calendar,
} from 'lucide-react';

export interface FeatureConfig {
  uniqueId: string;
  route: string;
  icon: React.ReactNode;
  defaultLabel: string; // fallback if name is not provided
}

// Feature mapping based on uniqueId from login response
export const FEATURE_MAPPING: Record<string, FeatureConfig> = {
  // Core features that are always available
  dashboard: {
    uniqueId: 'dashboard',
    route: '/dashboard',
    icon: <Home size={24} />,
    defaultLabel: 'Dashboard',
  },
  profile_setting: {
    uniqueId: 'profile_setting',
    route: '/profile-setting',
    icon: <UserCog size={24} />,
    defaultLabel: 'Profile Setting',
  },

  // Dynamic features from API
  user_management: {
    uniqueId: 'user_management',
    route: '/user-management',
    icon: <UsersRound size={24} />,
    defaultLabel: 'User Management',
  },
  employee_management: {
    uniqueId: 'employee_management',
    route: '/employee-management',
    icon: <IdCardLanyard size={24} />,
    defaultLabel: 'Employee Management',
  },
  role_management: {
    uniqueId: 'role_management',
    route: '/role-management',
    icon: <Settings size={24} />,
    defaultLabel: 'Role Management',
  },
  feature_management: {
    uniqueId: 'feature_management',
    route: '/feature-management',
    icon: <BadgeCheck size={24} />,
    defaultLabel: 'Feature Management',
  },
  enterprise_management: {
    uniqueId: 'enterprise_management',
    route: '/enterprise-management',
    icon: <Building2 size={24} />,
    defaultLabel: 'Enterprise Management',
  },
  form_builder: {
    uniqueId: 'form_builder',
    route: '/form-list',
    icon: <FolderPen size={24} />,
    defaultLabel: 'Form Builder',
  },
  venue_management: {
    uniqueId: 'venue_management',
    route: '/venue-management',
    icon: <LayoutGrid size={24} />,
    defaultLabel: 'Venue Service',
  },
  service_category: {
    uniqueId: 'service_category',
    route: '/service-category',
    icon: <Package size={24} />,
    defaultLabel: 'Service Category',
  },
  vendor_management: {
    uniqueId: 'vendor_management',
    route: '/vendor-management',
    icon: <UserLockIcon size={24} />,
    defaultLabel: 'Vendor Service',
  },
  content_policy: {
    uniqueId: 'content_policy',
    route: '/content-policy',
    icon: <FileText size={24} />,
    defaultLabel: 'Content Policy',
  },
  booking_management: {
    uniqueId: 'booking_management',
    route: '/booking-management',
    icon: <Calendar size={24} />,
    defaultLabel: 'Booking Management',
  },
};

// Helper function to get feature config by uniqueId
export const getFeatureConfig = (uniqueId: string): FeatureConfig | null => {
  return FEATURE_MAPPING[uniqueId] || null;
};

// Helper function to generate menu items from user features
export interface MenuItemFromFeature {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | null;
  feature: string;
  uniqueId: string;
}

// Generate all possible menu items for Super Admin
export const generateAllMenuItems = (): MenuItemFromFeature[] => {
  const menuItems: MenuItemFromFeature[] = [];
  
  // Always add Dashboard first
  const dashboardConfig = getFeatureConfig('dashboard');
  if (dashboardConfig) {
    menuItems.push({
      to: dashboardConfig.route,
      label: dashboardConfig.defaultLabel,
      icon: dashboardConfig.icon,
      badge: null,
      feature: dashboardConfig.defaultLabel,
      uniqueId: dashboardConfig.uniqueId,
    });
  }

  // Add all possible features for Super Admin (in order)
  const allFeatureIds = [
    'user_management',
    'employee_management', 
    'role_management',
    'feature_management',
    'enterprise_management',
    'form_builder',
    'venue_management',
    'service_category',
    'vendor_management',
    'booking_management',
    'content_policy',
  ];

  allFeatureIds.forEach(uniqueId => {
    const config = getFeatureConfig(uniqueId);
    if (config) {
      menuItems.push({
        to: config.route,
        label: config.defaultLabel, // Use default label for Super Admin
        icon: config.icon,
        badge: null,
        feature: config.defaultLabel,
        uniqueId: config.uniqueId,
      });
    }
  });

  // Always add Profile Setting at the end
  const profileConfig = getFeatureConfig('profile_setting');
  if (profileConfig) {
    menuItems.push({
      to: profileConfig.route,
      label: profileConfig.defaultLabel,
      icon: profileConfig.icon,
      badge: null,
      feature: profileConfig.defaultLabel,
      uniqueId: profileConfig.uniqueId,
    });
  }

  return menuItems;
};

export const generateMenuItemsFromFeatures = (userFeatures: Array<{
  id: string;
  name: string;
  uniqueId: string;
  permission?: {
    read?: boolean;
    write?: boolean;
    admin?: boolean;
  };
}>): MenuItemFromFeature[] => {
  const menuItems: MenuItemFromFeature[] = [];
  
  // Generate menu items from user features

  // Always add Dashboard first
  const dashboardConfig = getFeatureConfig('dashboard');
  if (dashboardConfig) {
    menuItems.push({
      to: dashboardConfig.route,
      label: dashboardConfig.defaultLabel,
      icon: dashboardConfig.icon,
      badge: null,
      feature: dashboardConfig.defaultLabel,
      uniqueId: dashboardConfig.uniqueId,
    });
  }

  // Add user features dynamically (excluding dashboard and profile_setting to avoid duplicates)
  userFeatures.forEach(feature => {
    // Skip dashboard and profile_setting as they are handled separately
    if (feature.uniqueId === 'dashboard' || feature.uniqueId === 'profile_setting') {
      return;
    }
    
    const config = getFeatureConfig(feature.uniqueId);
    if (config) {
      menuItems.push({
        to: config.route,
        label: feature.name, // Use API name instead of default label
        icon: config.icon,
        badge: null,
        feature: feature.name,
        uniqueId: feature.uniqueId,
      });
    } else {
      // Add a fallback menu item with default icon for unmapped features
      menuItems.push({
        to: `/${feature.uniqueId.replace(/_/g, '-')}`, // Convert underscore to dash for route
        label: feature.name,
        icon: <Settings size={24} />, // Default icon
        badge: null,
        feature: feature.name,
        uniqueId: feature.uniqueId,
      });
    }
  });

  // Always add Profile Setting at the end
  const profileConfig = getFeatureConfig('profile_setting');
  if (profileConfig) {
    menuItems.push({
      to: profileConfig.route,
      label: profileConfig.defaultLabel,
      icon: profileConfig.icon,
      badge: null,
      feature: profileConfig.defaultLabel,
      uniqueId: profileConfig.uniqueId,
    });
  }

  return menuItems;
};
