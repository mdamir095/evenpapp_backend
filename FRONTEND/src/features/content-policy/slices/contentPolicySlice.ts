import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ContentPolicy } from '../../../types/ContentPolicy';

interface ContentPolicyState {
  contentPolicies: ContentPolicy[];
  selectedContentPolicy: ContentPolicy | null;
  loading: boolean; // For list fetching (skeleton)
  formLoading: boolean; // For form operations (add/update/delete)
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const initialState: ContentPolicyState = {
  selectedContentPolicy: null,
  contentPolicies: [],
  loading: false,
  formLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
};

export const contentPolicySlice = createSlice({
  name: 'contentPolicy',
  initialState,
  reducers: {
    fetchContentPoliciesStart(state) {
      state.loading = true;
      state.error = null;
    },
    
    fetchContentPoliciesSuccess(
          state,
          action: PayloadAction<{
            contentPolicies: ContentPolicy[];
            pagination: {
              total: number;
              page: number;
              limit: number;
              totalPages: number;
            };
          }>
        ) {
          state.loading = false;
          state.contentPolicies = action.payload.contentPolicies;
          state.pagination = action.payload.pagination;
          state.error = null;
        },
    fetchContentPoliciesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    addContentPolicyStart(state) {
      state.formLoading = true;
      state.error = null;
    },
    addContentPolicySuccess(state, action: PayloadAction<ContentPolicy>) {
      state.formLoading = false;
      state.contentPolicies.push(action.payload);
    },
    addContentPolicyFailure(state, action: PayloadAction<string>) {
      state.formLoading = false;
      state.error = action.payload;
    },
    removeContentPolicyStart(state) {
      state.formLoading = true;
      state.error = null;
    },
    removeContentPolicySuccess(state, action: PayloadAction<string>) {
      state.formLoading = false;
      state.contentPolicies = state.contentPolicies.filter((contentPolicy: ContentPolicy) => contentPolicy.id !== action.payload);
    },
    removeContentPolicyFailure(state, action: PayloadAction<string>) {
      state.formLoading = false;
      state.error = action.payload;
    },
    updateContentPolicyStart(state) {
      state.formLoading = true;
      state.error = null;
    },
    updateContentPolicySuccess(state, action: PayloadAction<ContentPolicy>) {
      state.formLoading = false;
      state.contentPolicies = state.contentPolicies.map((contentPolicy: ContentPolicy) =>
        contentPolicy.id === action.payload.id ? action.payload : contentPolicy
      );
    },
    updateContentPolicyFailure(state, action: PayloadAction<string>) {
      state.formLoading = false;
      state.error = action.payload;
    },
    fetchContentPolicyByIdStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchContentPolicyByIdSuccess(state, action: PayloadAction<ContentPolicy>) {
      state.loading = false;
      state.selectedContentPolicy = action.payload;
    },
    fetchContentPolicyByIdFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchContentPoliciesStart, 
  fetchContentPoliciesSuccess, 
  fetchContentPoliciesFailure, 
  addContentPolicyStart, 
  addContentPolicySuccess, 
  addContentPolicyFailure, 
  removeContentPolicyStart, 
  removeContentPolicySuccess, 
  removeContentPolicyFailure, 
  updateContentPolicyStart, 
  updateContentPolicySuccess, 
  updateContentPolicyFailure,
  fetchContentPolicyByIdStart, 
  fetchContentPolicyByIdSuccess, 
  fetchContentPolicyByIdFailure 
} = contentPolicySlice.actions;
