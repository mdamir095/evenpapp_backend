import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ServiceCategory } from '../../../types/ServiceCategory';

interface CategoryState {
  categories: ServiceCategory[];
  selectedCategory: ServiceCategory | null;
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

const initialState: CategoryState = {
  selectedCategory: null,
  categories: [],
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

export const serviceCategorySlice = createSlice({
  name: 'serviceCategory',
  initialState,
  reducers: {
    fetchCategoriesStart(state) {
      state.loading = true;
      state.error = null;
    },
    
    fetchCategoriesSuccess(
          state,
          action: PayloadAction<{
            categories: ServiceCategory[];
            pagination: {
              total: number;
              page: number;
              limit: number;
              totalPages: number;
            };
          }>
        ) {
          state.loading = false;
          state.categories = action.payload.categories;
          state.pagination = action.payload.pagination;
          state.error = null;
        },
    fetchCategoriesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    addCategoryStart(state) {
      state.formLoading = true;
      state.error = null;
    },
    addCategorySuccess(state, action: PayloadAction<ServiceCategory>) {
      state.formLoading = false;
      state.categories.push(action.payload);
    },
    addCategoryFailure(state, action: PayloadAction<string>) {
      state.formLoading = false;
      state.error = action.payload;
    },
    removeCategoryStart(state) {
      state.formLoading = true;
      state.error = null;
    },
    removeCategorySuccess(state, action: PayloadAction<string>) {
      state.formLoading = false;
      state.categories = state.categories.filter((category: ServiceCategory) => category.id !== action.payload);
    },
    removeCategoryFailure(state, action: PayloadAction<string>) {
      state.formLoading = false;
      state.error = action.payload;
    },
    updateCategoryStart(state) {
      state.formLoading = true;
      state.error = null;
    },
    updateCategorySuccess(state, action: PayloadAction<ServiceCategory>) {
      state.formLoading = false;
      state.categories = state.categories.map((category: ServiceCategory) =>
        category.id === action.payload.id ? action.payload : category
      );
    },
    updateCategoryFailure(state, action: PayloadAction<string>) {
      state.formLoading = false;
      state.error = action.payload;
    },
    fetchCategoryByIdStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCategoryByIdSuccess(state, action: PayloadAction<ServiceCategory>) {
      state.loading = false;
      state.selectedCategory = action.payload;
    },
    fetchCategoryByIdFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {fetchCategoriesStart, fetchCategoriesSuccess, fetchCategoriesFailure, addCategoryStart, addCategorySuccess, addCategoryFailure, removeCategoryStart, removeCategorySuccess, removeCategoryFailure, updateCategoryStart, updateCategorySuccess, updateCategoryFailure,fetchCategoryByIdStart, fetchCategoryByIdSuccess, fetchCategoryByIdFailure } = serviceCategorySlice.actions;
