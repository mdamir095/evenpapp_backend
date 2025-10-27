import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { VenueCategory, VenueCategoryFilters } from '../../../types/VenueCategory';

interface VenueCategoryState {
  categories: VenueCategory[];
  selectedCategory: VenueCategory | null;
  filters: VenueCategoryFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  loading: boolean;
  error: string | null;
  actionLoading: {
    create: boolean;
    update: boolean;
    delete: boolean;
  };
}

const initialState: VenueCategoryState = {
  categories: [],
  selectedCategory: null,
  filters: {
    search: '',
    isActive: undefined,
    sortBy: 'name',
    sortOrder: 'asc',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
  loading: false,
  error: null,
  actionLoading: {
    create: false,
    update: false,
    delete: false,
  },
};

export const venueCategorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    fetchCategoryStart(state) {
      state.loading = true;
      state.error = null;
    },
    
    fetchCategorySuccess(
          state,
          action: PayloadAction<{
            categories:  VenueCategory[];
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
    fetchCategoryFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    addCategoryStart(state) {
      state.loading = true;
      state.error = null;
    },
    addCategorySuccess(state, action: PayloadAction<VenueCategory>) {
      state.loading = false;
      state.categories.push(action.payload);
    },
    addCategoryFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    removeCategoryStart(state) {
      state.loading = true;
      state.error = null;
    },
    removeCategorySuccess(state, action: PayloadAction<string>) {
      state.loading = false;
      state.categories = state.categories.filter((category: VenueCategory) => category.id !== action.payload);
    },
    removeCategoryFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    updateCategoryStart(state) {
      state.loading = true;
      state.error = null;
    },
    updateCategorySuccess(state, action: PayloadAction<VenueCategory>) {
      state.loading = false;
      state.categories = state.categories.map((category: VenueCategory) =>
        category.id === action.payload.id ? action.payload : category
      );
    },
    updateCategoryFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchCategoryByIdStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCategoryByIdSuccess(state, action: PayloadAction<VenueCategory>) {
      state.loading = false;
      state.selectedCategory = action.payload;
    },
    fetchCategoryByIdFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {fetchCategoryStart, fetchCategorySuccess, fetchCategoryFailure, addCategoryStart, addCategorySuccess, addCategoryFailure, removeCategoryStart, removeCategorySuccess, removeCategoryFailure, updateCategoryStart, updateCategorySuccess, updateCategoryFailure,fetchCategoryByIdStart, fetchCategoryByIdSuccess, fetchCategoryByIdFailure } = venueCategorySlice.actions;
