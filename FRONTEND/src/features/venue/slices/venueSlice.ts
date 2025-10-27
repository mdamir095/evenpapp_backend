import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Venue } from '../../../types/Venue';

interface VenueState {
  venues: Venue[];
  selectedVenue: Venue | null;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const initialState: VenueState = {
  venues: [],
  selectedVenue: null,
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
};

export const VenueSlice = createSlice({
  name: 'venue',
  initialState,
  reducers: {
    addVenueStart(state) {
      state.loading = true;
      state.error = null;
    },
    addVenueSuccess(state) {
      state.loading = false;
      state.error = null;
    },
    addVenueFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    }, 
    fetchCategoryStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCategorySuccess(state) {
      state.loading = false;
    },
    fetchCategoryFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchVenueStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchVenueSuccess(state, action: PayloadAction<{ venues: Venue[]; pagination: any }>) {
      state.loading = false;
      state.venues = action.payload.venues;
      state.pagination = action.payload.pagination;
      state.error = null;
    },
    fetchVenueFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    removeVenueStart(state) {
      state.loading = true;
      state.error = null;
    },
    removeVenueSuccess(state, action: PayloadAction<string>) {
      state.loading = false;
      state.venues = state.venues.filter((venue:any) => venue.id !== action.payload);
      state.error = null;
    },
    removeVenueFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    updateVenueStart(state) {
      state.loading = true;
      state.error = null;
    },
    updateVenueSuccess(state, action: PayloadAction<{ id: string; data: Venue }>) {
      state.loading = false;
      const index = state.venues.findIndex((venue:any) => venue.id === action.payload.id);
      if (index !== -1) {
        state.venues[index] = { ...state.venues[index], ...action.payload.data };
      }
      state.error = null;
    },
    updateVenueFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchVenueByIdStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchVenueByIdSuccess(state, action: PayloadAction<Venue>) {
      state.loading = false;
      state.selectedVenue = action.payload;
      state.error = null;
    },
    fetchVenueByIdFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    resetVenueState(state) {
      state.venues = [];
      state.selectedVenue = null;
      state.loading = false;
      state.error = null;
      state.pagination = {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
    },
  },
});

export const {
   addVenueStart, 
   addVenueSuccess, 
   addVenueFailure,
  fetchVenueStart,
  fetchVenueSuccess,
  fetchVenueFailure,
  removeVenueStart,
  removeVenueSuccess,
  removeVenueFailure,
  updateVenueStart,
  updateVenueSuccess,
  updateVenueFailure,
  fetchVenueByIdStart,
  fetchVenueByIdSuccess,
  fetchVenueByIdFailure,
  resetVenueState
} = VenueSlice.actions;