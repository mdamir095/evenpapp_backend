import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { VendorCategory } from '../../../types/VendorCategory';

interface VendorCategoryState {
  vendorCategories: VendorCategory[];
  selectedVendorCategory: VendorCategory | null;
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

const initialState: VendorCategoryState = {
  selectedVendorCategory: null,
  vendorCategories: [],
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

export const vendorCategorySlice = createSlice({
  name: 'vendorCategory',
  initialState,
  reducers: {
    fetchVendorCategoriesStart(state) {
      state.loading = true;
      state.error = null;
    },
    
    fetchVendorCategoriesSuccess(
          state,
          action: PayloadAction<{
            vendorCategories: VendorCategory[];
            pagination: {
              total: number;
              page: number;
              limit: number;
              totalPages: number;
            };
          }>
        ) {
          state.loading = false;
          state.vendorCategories = action.payload.vendorCategories;
          state.pagination = action.payload.pagination;
          state.error = null;
        },
    fetchVendorCategoriesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    addVendorCategoryStart(state) {
      state.formLoading = true;
      state.error = null;
    },
    addVendorCategorySuccess(state, action: PayloadAction<VendorCategory>) {
      state.formLoading = false;
      state.vendorCategories.push(action.payload);
    },
    addVendorCategoryFailure(state, action: PayloadAction<string>) {
      state.formLoading = false;
      state.error = action.payload;
    },
    removeVendorCategoryStart(state) {
      state.formLoading = true;
      state.error = null;
    },
    removeVendorCategorySuccess(state, action: PayloadAction<string>) {
      state.formLoading = false;
      state.vendorCategories = state.vendorCategories.filter((category: VendorCategory) => category.id !== action.payload);
    },
    removeVendorCategoryFailure(state, action: PayloadAction<string>) {
      state.formLoading = false;
      state.error = action.payload;
    },
    updateVendorCategoryStart(state) {
      state.formLoading = true;
      state.error = null;
    },
    updateVendorCategorySuccess(state, action: PayloadAction<VendorCategory>) {
      state.formLoading = false;
      state.vendorCategories = state.vendorCategories.map((category: VendorCategory) =>
        category.id === action.payload.id ? action.payload : category
      );
    },
    updateVendorCategoryFailure(state, action: PayloadAction<string>) {
      state.formLoading = false;
      state.error = action.payload;
    },
    fetchVendorCategoryByIdStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchVendorCategoryByIdSuccess(state, action: PayloadAction<VendorCategory>) {
      state.loading = false;
      state.selectedVendorCategory = action.payload;
    },
    fetchVendorCategoryByIdFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    updateVendorCategoryStatusStart(state) {
      state.formLoading = true;
      state.error = null;
    },
    updateVendorCategoryStatusSuccess(state, action: PayloadAction<VendorCategory>) {
      state.formLoading = false;
      state.vendorCategories = state.vendorCategories.map((category: VendorCategory) =>
        category.id === action.payload.id ? action.payload : category
      );
    },
    updateVendorCategoryStatusFailure(state, action: PayloadAction<string>) {
      state.formLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchVendorCategoriesStart, 
  fetchVendorCategoriesSuccess, 
  fetchVendorCategoriesFailure, 
  addVendorCategoryStart, 
  addVendorCategorySuccess, 
  addVendorCategoryFailure, 
  removeVendorCategoryStart, 
  removeVendorCategorySuccess, 
  removeVendorCategoryFailure, 
  updateVendorCategoryStart, 
  updateVendorCategorySuccess, 
  updateVendorCategoryFailure,
  fetchVendorCategoryByIdStart, 
  fetchVendorCategoryByIdSuccess, 
  fetchVendorCategoryByIdFailure,
  updateVendorCategoryStatusStart,
  updateVendorCategoryStatusSuccess,
  updateVendorCategoryStatusFailure,
} = vendorCategorySlice.actions;
