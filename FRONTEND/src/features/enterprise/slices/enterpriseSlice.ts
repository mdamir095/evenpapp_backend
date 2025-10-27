import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Role, Enterprise } from '../../../types/User';

interface EnterpriseState {
  enterprises: Enterprise[];
  features: Role[];
  selectedEnterprise: Enterprise | null;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const initialState: EnterpriseState = {
  enterprises: [],
  features: [],
  selectedEnterprise: null,
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
};

export const enterpriseSlice = createSlice({
  name: 'enterprise',
  initialState,
  reducers: {
    fetchEnterprisesStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchEnterprisesSuccess(
      state,
      action: PayloadAction<{
        enterprises: Enterprise[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>
    ) {
      state.loading = false;
      state.enterprises = action.payload.enterprises;
      state.pagination = action.payload.pagination;
      state.error = null;
    },    
    fetchEnterprisesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    addEnterpriseStart(state) {
      state.loading = true;
      state.error = null;
    },
    addEnterpriseSuccess(state, action: PayloadAction<Enterprise>) {
      state.loading = false;
      state.enterprises.push(action.payload);
    },
    addEnterpriseFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    removeEnterpriseStart(state) {
      state.loading = true;
      state.error = null;
    },
    removeEnterpriseSuccess(state, action: PayloadAction<string>) {
      state.loading = false;
      state.enterprises = state.enterprises.filter((enterprise: Enterprise) => enterprise.id !== action.payload);
    },
    removeEnterpriseFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    updateEnterpriseStart(state) {
      state.loading = true;
      state.error = null;
    },
    updateEnterpriseSuccess(state, action: PayloadAction<Enterprise>) {
      state.loading = false;
      state.enterprises = state.enterprises.map((enterprise: Enterprise) =>
        enterprise.id === action.payload.id ? action.payload : enterprise
      );
    },
    updateEnterpriseFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchEnterpriseByIdStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchEnterpriseByIdSuccess(state, action: PayloadAction<Enterprise>) {
      state.loading = false;
      state.selectedEnterprise = action.payload;
    },
    fetchEnterpriseByIdFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchEnterpriseStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchEnterpriseSuccess(state, action: PayloadAction<Role[]>) {
      state.loading = false;
      state.features = action.payload;
    },
    fetchEnterpriseFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    resetPasswordStart(state) {
      state.loading = true;
      state.error = null;
    },
    resetPasswordSuccess(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = null;
    },
    resetPasswordFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {fetchEnterprisesStart, fetchEnterprisesSuccess, fetchEnterprisesFailure, addEnterpriseStart, addEnterpriseSuccess, addEnterpriseFailure, removeEnterpriseStart, removeEnterpriseSuccess, removeEnterpriseFailure, updateEnterpriseStart, updateEnterpriseSuccess, updateEnterpriseFailure,fetchEnterpriseByIdStart, fetchEnterpriseByIdSuccess, fetchEnterpriseByIdFailure, fetchEnterpriseStart, fetchEnterpriseSuccess, fetchEnterpriseFailure, resetPasswordStart, resetPasswordSuccess, resetPasswordFailure } = enterpriseSlice.actions;
