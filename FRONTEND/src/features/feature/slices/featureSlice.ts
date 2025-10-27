import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Feature } from '../../../types/User';

interface FeatureState {
  features: Feature[];
  selectedFeature: Feature | null;
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

const initialState: FeatureState = {
  selectedFeature: null,
  features: [],
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

export const featureSlice = createSlice({
  name: 'feature',
  initialState,
  reducers: {
    fetchFeaturesStart(state) {
      state.loading = true;
      state.error = null;
    },
    
    fetchFeaturesSuccess(
          state,
          action: PayloadAction<{
            features:  Feature[];
            pagination: {
              total: number;
              page: number;
              limit: number;
              totalPages: number;
            };
          }>
        ) {
          state.loading = false;
          state.features = action.payload.features;
          state.pagination = action.payload.pagination;
          state.error = null;
        },
    fetchFeaturesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    addFeatureStart(state) {
      state.formLoading = true;
      state.error = null;
    },
    addFeatureSuccess(state, action: PayloadAction<Feature>) {
      state.formLoading = false;
      state.features.push(action.payload);
    },
    addFeatureFailure(state, action: PayloadAction<string>) {
      state.formLoading = false;
      state.error = action.payload;
    },
    removeFeatureStart(state) {
      state.formLoading = true;
      state.error = null;
    },
    removeFeatureSuccess(state, action: PayloadAction<string>) {
      state.formLoading = false;
      state.features = state.features.filter((feature: Feature) => feature.id !== action.payload);
    },
    removeFeatureFailure(state, action: PayloadAction<string>) {
      state.formLoading = false;
      state.error = action.payload;
    },
    updateFeatureStart(state) {
      state.formLoading = true;
      state.error = null;
    },
    updateFeatureSuccess(state, action: PayloadAction<Feature>) {
      state.formLoading = false;
      state.features = state.features.map((feature: Feature) =>
        feature.id === action.payload.id ? action.payload : feature
      );
    },
    updateFeatureFailure(state, action: PayloadAction<string>) {
      state.formLoading = false;
      state.error = action.payload;
    },
    fetchFeatureByIdStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchFeatureByIdSuccess(state, action: PayloadAction<Feature>) {
      state.loading = false;
      state.selectedFeature = action.payload;
    },
    fetchFeatureByIdFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {fetchFeaturesStart, fetchFeaturesSuccess, fetchFeaturesFailure, addFeatureStart, addFeatureSuccess, addFeatureFailure, removeFeatureStart, removeFeatureSuccess, removeFeatureFailure, updateFeatureStart, updateFeatureSuccess, updateFeatureFailure,fetchFeatureByIdStart, fetchFeatureByIdSuccess, fetchFeatureByIdFailure } = featureSlice.actions;
