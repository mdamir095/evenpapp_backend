import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Role,FeaturePermission } from '../../../types/User';

interface RoleState {
  featurePermissions: any;
  roles: Role[];
  selectedRole: Role | null;
  loading: boolean; // For list fetching (skeleton)
  formLoading: boolean; // For form operations (add/update/delete)
  featuresLoading: boolean;
  features: FeaturePermission[];
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const initialState: RoleState = {
  featurePermissions: [],
  selectedRole: null,
  roles: [],
  loading: false,
  formLoading: false,
  featuresLoading: false,
  features: [],
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
};

export const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {
    fetchRolesStart(state) {
      state.loading = true;
      state.error = null;
    },
    
    fetchRolesSuccess(
          state,
          action: PayloadAction<{
            roles:  Role[];
            pagination: {
              total: number;
              page: number;
              limit: number;
              totalPages: number;
            };
          }>
        ) {
          state.loading = false;
          state.roles = action.payload.roles;
          state.pagination = action.payload.pagination;
          state.error = null;
        },
    fetchRolesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    addRoleStart(state) {
      state.formLoading = true;
      state.error = null;
    },
    addRoleSuccess(state, action: PayloadAction<Role>) {
      state.formLoading = false;
      state.roles.push(action.payload);
    },
    addRoleFailure(state, action: PayloadAction<string>) {
      state.formLoading = false;
      state.error = action.payload;
    },
    removeRoleStart(state) {
      state.formLoading = true;
      state.error = null;
    },
    removeRoleSuccess(state, action: PayloadAction<string>) {
      state.formLoading = false;
      state.roles = state.roles.filter((role: Role) => role.id !== action.payload);
    },
    removeRoleFailure(state, action: PayloadAction<string>) {
      state.formLoading = false;
      state.error = action.payload;
    },
    updateRoleStart(state) {
      state.formLoading = true;
      state.error = null;
    },
    updateRoleSuccess(state, action: PayloadAction<Role>) {
      state.formLoading = false;
      
      // Ensure we have valid data
      if (!action.payload || !action.payload.id) {
        return;
      }
      
      // Find the index of the role to update
      const roleIndex = state.roles.findIndex((role: Role) => {
        const roleIdStr = String(role.id);
        const payloadIdStr = String(action.payload.id);
        return roleIdStr === payloadIdStr;
      });
      
      if (roleIndex !== -1) {
        // Replace the role at the found index - ensure we maintain the structure
        const updatedRole = {
          ...state.roles[roleIndex],
          ...action.payload,
          id: action.payload.id // Ensure ID is preserved
        };
        state.roles[roleIndex] = updatedRole;
      } else {
        // As a fallback, try to add the role if it's not found (shouldn't happen normally)
        state.roles.push(action.payload);
      }
      
      // Force a complete re-render by creating a new array reference
      state.roles = [...state.roles];
    },
    updateRoleFailure(state, action: PayloadAction<string>) {
      state.formLoading = false;
      state.error = action.payload;
    },
    fetchRoleByIdStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchRoleByIdSuccess(state, action: PayloadAction<Role>) {
      state.loading = false;
      state.selectedRole = action.payload;
    },
    fetchRoleByIdFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchFeaturesStart(state) {
      state.featuresLoading = true;
      state.error = null;
    },
    fetchFeaturesSuccess(state, action: PayloadAction<FeaturePermission[]>) {
      state.featuresLoading = false;
      state.features = action.payload;
    },
    fetchFeaturesFailure(state, action: PayloadAction<string>) {
      state.featuresLoading = false;
      state.error = action.payload;
    },
  },
});

export const {fetchRolesStart, fetchRolesSuccess, fetchRolesFailure, addRoleStart, addRoleSuccess, addRoleFailure, removeRoleStart, removeRoleSuccess, removeRoleFailure, updateRoleStart, updateRoleSuccess, updateRoleFailure,fetchRoleByIdStart, fetchRoleByIdSuccess, fetchRoleByIdFailure, fetchFeaturesStart, fetchFeaturesSuccess, fetchFeaturesFailure } = roleSlice.actions;
