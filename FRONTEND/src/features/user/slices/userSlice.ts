import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Role, User } from '../../../types/User';

interface Feature {
  id: string;
  name: string;
}

interface UserState {
  users: User[];
  roles: Role[];
  features: Feature[]; // ✅ Added features
  selectedUser: User | null;
  loading: boolean;
  formLoading: boolean; // ✅ Separate form loading state
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const initialState: UserState = {
  users: [],
  roles: [],
  features: [], // ✅ Added features
  selectedUser: null,
  loading: false,
  formLoading: false, // ✅ Added formLoading
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
};

export const userSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    fetchUsersStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchUsersSuccess(
      state,
      action: PayloadAction<{
        users: User[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>
    ) {
      state.loading = false;
      state.users = action.payload.users;
      state.pagination = action.payload.pagination;
      state.error = null;
    },    
    fetchUsersFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    addUserStart(state) {
      state.formLoading = true; // ✅ Use formLoading for form operations
      state.error = null;
    },
    addUserSuccess(state, action: PayloadAction<User>) {
      state.formLoading = false; // ✅ Use formLoading
      state.users.push(action.payload);
    },
    addUserFailure(state, action: PayloadAction<string>) {
      state.formLoading = false; // ✅ Use formLoading
      state.error = action.payload;
    },
    removeUserStart(state) {
      state.formLoading = true; // ✅ Use formLoading
      state.error = null;
    },
    removeUserSuccess(state, action: PayloadAction<string>) {
      state.formLoading = false; // ✅ Use formLoading
      state.users = state.users.filter((user: User) => user._id !== action.payload);
    },
    removeUserFailure(state, action: PayloadAction<string>) {
      state.formLoading = false; // ✅ Use formLoading
      state.error = action.payload;
    },
    updateUserStart(state) {
      state.formLoading = true; // ✅ Use formLoading
      state.error = null;
    },
    updateUserSuccess(state, action: PayloadAction<User>) {
      state.formLoading = false; // ✅ Use formLoading
      state.users = state.users.map((user: User) =>
        user._id === action.payload._id ? action.payload : user
      );
    },
    updateUserFailure(state, action: PayloadAction<string>) {
      state.formLoading = false; // ✅ Use formLoading
      state.error = action.payload;
    },
    fetchUserByIdStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchUserByIdSuccess(state, action: PayloadAction<User>) {
      state.loading = false;
      state.selectedUser = action.payload;
    },
    fetchUserByIdFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchRolesStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchRolesSuccess(state, action: PayloadAction<Role[]>) {
      state.loading = false;
      state.roles = action.payload;
    },
    fetchRolesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    // ✅ Features actions
    fetchFeaturesStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchFeaturesSuccess(state, action: PayloadAction<Feature[]>) {
      state.loading = false;
      state.features = action.payload;
    },
    fetchFeaturesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchUsersStart, 
  fetchUsersSuccess, 
  fetchUsersFailure, 
  addUserStart, 
  addUserSuccess, 
  addUserFailure, 
  removeUserStart, 
  removeUserSuccess, 
  removeUserFailure, 
  updateUserStart, 
  updateUserSuccess, 
  updateUserFailure,
  fetchUserByIdStart, 
  fetchUserByIdSuccess, 
  fetchUserByIdFailure, 
  fetchRolesStart, 
  fetchRolesSuccess, 
  fetchRolesFailure,
  // ✅ Features actions
  fetchFeaturesStart,
  fetchFeaturesSuccess,
  fetchFeaturesFailure
} = userSlice.actions;
