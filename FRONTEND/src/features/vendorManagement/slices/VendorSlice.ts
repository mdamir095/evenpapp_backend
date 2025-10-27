import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Vendor } from '../../../types/Vendor';

interface VendorState {
  vendors: Vendor[];
  selectedVendor: Vendor | null;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
}

const initialState: VendorState = {
  vendors: [],
  selectedVendor: null,
  loading: false,
  error: null,
  pagination: null,
};

const vendorSlice = createSlice({
  name: 'vendor',
  initialState,
  reducers: {
    // Fetch vendors
    fetchVendorsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchVendorsSuccess: (state, action: PayloadAction<{ vendors: Vendor[]; pagination: any }>) => {
      state.loading = false;
      state.vendors = Array.isArray(action.payload.vendors) ? action.payload.vendors : [];
      state.pagination = action.payload.pagination;
      state.error = null;
    },
    fetchVendorsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch vendor by ID
    fetchVendorByIdStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchVendorByIdSuccess: (state, action: PayloadAction<Vendor>) => {
      state.loading = false;
      state.selectedVendor = action.payload;
      state.error = null;
    },
    fetchVendorByIdFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Add vendor
    addVendorStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    addVendorSuccess: (state, action: PayloadAction<Vendor>) => {
      state.loading = false;
      state.vendors.push(action.payload);
      state.error = null;
    },
    addVendorFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update vendor
    updateVendorStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateVendorSuccess: (state, action: PayloadAction<Vendor>) => {
      state.loading = false;
      const index = state.vendors.findIndex((vendor) => vendor.id === action.payload.id);
      if (index !== -1) {
        state.vendors[index] = action.payload;
      }
      state.selectedVendor = action.payload;
      state.error = null;
    },
    updateVendorFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Remove vendor
    removeVendorStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    removeVendorSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.vendors = state.vendors.filter((vendor) => vendor.id !== action.payload);
      state.error = null;
    },
    removeVendorFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear selected vendor
    clearSelectedVendor: (state) => {
      state.selectedVendor = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchVendorsStart,
  fetchVendorsSuccess,
  fetchVendorsFailure,
  fetchVendorByIdStart,
  fetchVendorByIdSuccess,
  fetchVendorByIdFailure,
  addVendorStart,
  addVendorSuccess,
  addVendorFailure,
  updateVendorStart,
  updateVendorSuccess,
  updateVendorFailure,
  removeVendorStart,
  removeVendorSuccess,
  removeVendorFailure,
  clearSelectedVendor,
  clearError,
} = vendorSlice.actions;

export default vendorSlice.reducer;
