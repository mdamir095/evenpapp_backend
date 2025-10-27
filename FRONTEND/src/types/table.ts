import type { ReactNode } from 'react';

// Base table row constraint - must have an id
export type TableRow = Record<string, any> & { 
  id: string | number;
};

// Column definition with proper typing
export interface TableColumn<T extends TableRow> {
  key: keyof T;
  label: string;
  width?: string | number;
  sortable?: boolean;
  searchable?: boolean;
  render?: (value: T[keyof T], row: T, index: number) => ReactNode;
  className?: string;
}

// Action types for row operations
export type TableAction = 'edit' | 'delete' | 'reset-password' | 'view' | 'activate' | 'deactivate' | 'block' | 'unblock' | 'location';

// Configuration object for table behavior
export interface TableConfig {
  permissions: {
    featureName?: string;
    showResetPasswordOption?: boolean;
  };
  ui: {
    showAddButton?: boolean;
    searchBar?: boolean;
    actionButtons?: boolean;
    roleSelect?: boolean;
  };
  pagination: {
    rowsPerPage?: number;
    serverSide?: boolean;
  };
  sorting: {
    defaultSortKey?: string;
    defaultSortOrder?: 'asc' | 'desc';
  };
}

// Props for the main table component
export interface TableComponentProps<T extends TableRow> {
  // Data
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  
  // Actions
  onRowAction?: (action: TableAction, row: T) => void;
  
  // Search
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchableColumns?: (keyof T)[];
  
  // Pagination
  total?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  rowsPerPage?: number;
  onRowsPerPageChange?: (size: number) => void;
  pageSizeOptions?: number[];
  
  // UI Configuration
  config?: Partial<TableConfig>;
  
  // Add button
  addButtonRoute?: string;
  addButtonText?: string;
  addButtonIcon?: ReactNode;
  
  // Additional UI elements
  actionButtons?: ReactNode;
  roleSelect?: ReactNode;
  heading?: string;
  
  // Roles dropdown (specific for User Management)
  rolesDropdown?: {
    roles: Array<{ name: string; id: string }>;
    selectedRole: string;
    onRoleChange: (role: string) => void;
  };
  
  // Enterprises dropdown (specific for Employee Management)
  enterprisesDropdown?: {
    enterprises: Array<{ enterpriseName: string; id: string }>;
    selectedEnterprise: string;
    onEnterpriseChange: (enterprise: string) => void;
  };
  
  // Legacy props (for backward compatibility)
  showAddButton?: boolean;
  searchBar?: ReactNode;
  featureName?: string;
  uniqueId?: string; // Recommended: use uniqueId instead of featureName
  showResetPasswordOption?: boolean;
  hideDeleteAction?: boolean;
  showLocationOption?: boolean;
}
