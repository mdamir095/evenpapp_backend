import { createSlice } from '@reduxjs/toolkit';
import type { BookingType } from '../schemas/booking.schema';

interface BookingState {
  bookings: BookingType[];
  selectedBooking: BookingType | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  loading: boolean;
  formLoading: boolean;
  error: string | null;
  searchQuery: string;
  filters: {
    status?: string;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
    customerId?: string;
  };
  availability: any[];
  availabilityLoading: boolean;
}

const initialState: BookingState = {
  bookings: [],
  selectedBooking: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  loading: false,
  formLoading: false,
  error: null,
  searchQuery: '',
  filters: {},
  availability: [],
  availabilityLoading: false,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    // Fetch bookings
    fetchBookingsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchBookingsSuccess: (state, action: { payload: { bookings: BookingType[]; pagination: any } }) => {
      state.loading = false;
      state.bookings = action.payload.bookings;
      state.pagination = action.payload.pagination;
      state.error = null;
    },
    fetchBookingsFailure: (state, action: { payload: string }) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch booking by ID
    fetchBookingByIdStart: (state) => {
      state.formLoading = true;
      state.error = null;
    },
    fetchBookingByIdSuccess: (state, action: { payload: BookingType }) => {
      state.formLoading = false;
      state.selectedBooking = action.payload;
      state.error = null;
    },
    fetchBookingByIdFailure: (state, action: { payload: string }) => {
      state.formLoading = false;
      state.error = action.payload;
    },

    // Add booking
    addBookingStart: (state) => {
      state.formLoading = true;
      state.error = null;
    },
    addBookingSuccess: (state, action: { payload: BookingType }) => {
      state.formLoading = false;
      state.bookings.unshift(action.payload);
      state.pagination.total += 1;
      state.error = null;
    },
    addBookingFailure: (state, action: { payload: string }) => {
      state.formLoading = false;
      state.error = action.payload;
    },

    // Update booking
    updateBookingStart: (state) => {
      state.formLoading = true;
      state.error = null;
    },
    updateBookingSuccess: (state, action: { payload: BookingType }) => {
      state.formLoading = false;
      const index = state.bookings.findIndex(booking => booking.bookingId === action.payload.bookingId);
      if (index !== -1) {
        state.bookings[index] = action.payload;
      }
      state.selectedBooking = action.payload;
      state.error = null;
    },
    updateBookingFailure: (state, action: { payload: string }) => {
      state.formLoading = false;
      state.error = action.payload;
    },

    // Remove booking
    removeBookingStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    removeBookingSuccess: (state, action: { payload: string }) => {
      state.loading = false;
      state.bookings = state.bookings.filter(booking => booking.bookingId !== action.payload);
      state.pagination.total -= 1;
      state.error = null;
    },
    removeBookingFailure: (state, action: { payload: string }) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update booking status
    updateBookingStatusStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateBookingStatusSuccess: (state, action: { payload: { bookingId: string; status: string } }) => {
      state.loading = false;
      const index = state.bookings.findIndex(booking => booking.bookingId === action.payload.bookingId);
      if (index !== -1) {
        state.bookings[index] = { ...state.bookings[index], status: action.payload.status as any };
      }
      state.error = null;
    },
    updateBookingStatusFailure: (state, action: { payload: string }) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Check availability
    checkAvailabilityStart: (state) => {
      state.availabilityLoading = true;
      state.error = null;
    },
    checkAvailabilitySuccess: (state, action: { payload: any[] }) => {
      state.availabilityLoading = false;
      state.availability = action.payload;
      state.error = null;
    },
    checkAvailabilityFailure: (state, action: { payload: string }) => {
      state.availabilityLoading = false;
      state.error = action.payload;
    },

    // Set search and filters
    setSearchQuery: (state, action: { payload: string }) => {
      state.searchQuery = action.payload;
    },
    setFilters: (state, action: { payload: Partial<BookingState['filters']> }) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
      state.searchQuery = '';
    },

    // Clear selected booking
    clearSelectedBooking: (state) => {
      state.selectedBooking = null;
    },

    // Clear errors
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchBookingsStart,
  fetchBookingsSuccess,
  fetchBookingsFailure,
  fetchBookingByIdStart,
  fetchBookingByIdSuccess,
  fetchBookingByIdFailure,
  addBookingStart,
  addBookingSuccess,
  addBookingFailure,
  updateBookingStart,
  updateBookingSuccess,
  updateBookingFailure,
  removeBookingStart,
  removeBookingSuccess,
  removeBookingFailure,
  updateBookingStatusStart,
  updateBookingStatusSuccess,
  updateBookingStatusFailure,
  checkAvailabilityStart,
  checkAvailabilitySuccess,
  checkAvailabilityFailure,
  setSearchQuery,
  setFilters,
  clearFilters,
  clearSelectedBooking,
  clearError,
} = bookingSlice.actions;

export default bookingSlice.reducer;
export { bookingSlice };
