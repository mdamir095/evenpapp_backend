import { useSelector } from 'react-redux';
import type { RootState } from '../../../redux/store';

export const useBooking = () => {
  return useSelector((state: RootState) => {
    // Fallback in case booking state is not initialized
    return state.booking || {
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
  });
};
