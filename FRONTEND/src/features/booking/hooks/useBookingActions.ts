import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import api from '../../../axios';
import { useToast } from '../../../components/atoms/Toast';
import { API_ROUTES } from '../../../constants/routes';
import { 
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
} from '../slices/bookingSlice';
import { 
  type BookingType,
  type AvailabilitySearchType,
  type CancelType,
  type RescheduleType,
  type UpdateBookingType, 
} from '../schemas/booking.schema';

export function useBookingActions() {
  const dispatch = useDispatch();
  const toast = useToast();

  // Get booking list with pagination and search
  const getBookingList = useCallback(
    async (page = 1, limit = 10, searchQuery = '', filters = {}) => {
      dispatch(fetchBookingsStart());
      try {
        const params: any = {
          page,
          limit,
          search: searchQuery,
          ...filters,
        };
        
        const response = await api.get(`${API_ROUTES.BOOKINGS}/admin`, {
          params,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const { bookings, total, page, limit } = response.data;
        
        // Transform backend data to frontend format
        const transformedBookings = (bookings || []).map((booking: any) => ({
          id: booking.id || booking._id || booking.bookingId,
          bookingNumber: booking.bookingId || booking.id || booking._id,
          customerName: booking.customerName || booking.userName || 'Unknown Customer',
          customerEmail: booking.customerEmail || booking.userEmail || 'unknown@example.com',
          serviceName: booking.title || booking.serviceName || 'Unknown Service',
          startDateTime: booking.eventDate || booking.startDateTime || new Date().toISOString(),
          endDateTime: booking.endDate || booking.endDateTime || new Date().toISOString(),
          status: booking.bookingStatus || booking.status || 'pending',
          amount: booking.price || booking.amount || 0,
          createdAt: booking.createdAt || new Date().toISOString(),
          assignedStaff: booking.assignedStaff || null,
          // Additional fields from backend
          title: booking.title,
          description: booking.description,
          location: booking.location,
          rating: booking.rating,
          imageUrl: booking.imageUrl,
          reviews: booking.reviews,
          bookingType: booking.bookingType,
          venueId: booking.venueId,
          vendorId: booking.vendorId,
          userId: booking.userId,
        }));
        
        
        dispatch(fetchBookingsSuccess({ 
          bookings: transformedBookings, 
          pagination: { total: total || 0, page: page || 1, limit: limit || 10 } 
        }));
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || 'Failed to fetch bookings';
        dispatch(fetchBookingsFailure(errorMessage));
      }
    },
    [dispatch]
  );

  // Get booking by ID
  const fetchBookingById = useCallback(async (bookingId: string) => {
    dispatch(fetchBookingByIdStart());
    try {
      const response = await api.get(`${API_ROUTES.BOOKINGS}/${bookingId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const bookingData = response.data?.data || response.data;
      dispatch(fetchBookingByIdSuccess(bookingData));
      return bookingData;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to fetch booking details';
      dispatch(fetchBookingByIdFailure(errorMessage));
      throw err;
    }
  }, [dispatch]);

  // Create booking
  const addBooking = useCallback(async (bookingData: BookingType) => {
    dispatch(addBookingStart());
    try {
      const response = await api.post(`${API_ROUTES.BOOKINGS}`, bookingData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });

      const bookingResponse = response.data?.data || response.data;
      dispatch(addBookingSuccess(bookingResponse));
      toast.success('Booking created successfully!');
      return bookingResponse;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to create booking';
      dispatch(addBookingFailure(errorMessage));
      toast.error(errorMessage);
      throw err;
    }
  }, [dispatch]);

  // Update booking
  const updateBooking = useCallback(async (bookingId: string, updateData: UpdateBookingType) => {
    dispatch(updateBookingStart());
    try {
      const response = await api.put(`${API_ROUTES.BOOKINGS}/${bookingId}`, updateData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });

      const bookingResponse = response.data?.data || response.data;
      dispatch(updateBookingSuccess(bookingResponse));
      toast.success('Booking updated successfully!');
      return bookingResponse;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to update booking';
      dispatch(updateBookingFailure(errorMessage));
      toast.error(errorMessage);
      throw err;
    }
  }, [dispatch]);

  // Remove booking
  const removeBooking = useCallback(async (bookingId: string) => {
    dispatch(removeBookingStart());
    try {
      await api.delete(`${API_ROUTES.BOOKINGS}/${bookingId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      dispatch(removeBookingSuccess(bookingId));
      toast.success('Booking deleted successfully!');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to delete booking';
      dispatch(removeBookingFailure(errorMessage));
      toast.error(errorMessage);
      throw err;
    }
  }, [dispatch]);

  // Update booking status
  const updateBookingStatus = useCallback(async (bookingId: string, status: string) => {
    dispatch(updateBookingStatusStart());
    try {
      const response = await api.patch(`${API_ROUTES.BOOKINGS}/${bookingId}/status`, 
        { status }, 
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          }
        }
      );

      dispatch(updateBookingStatusSuccess({ bookingId, status }));
      toast.success(`Booking ${status} successfully!`);
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to update booking status';
      dispatch(updateBookingStatusFailure(errorMessage));
      toast.error(errorMessage);
      throw err;
    }
  }, [dispatch]);

  // Cancel booking
  const cancelBooking = useCallback(async (cancelData: CancelType) => {
    try {
      const response = await api.post(`${API_ROUTES.BOOKINGS}/${cancelData.bookingId}/cancel`, cancelData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });

      // Update status in Redux store
      dispatch(updateBookingStatusSuccess({ bookingId: cancelData.bookingId, status: 'cancelled' }));
      toast.success('Booking cancelled successfully!');
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to cancel booking';
      toast.error(errorMessage);
      throw err;
    }
  }, [dispatch]);

  // Reschedule booking
  const rescheduleBooking = useCallback(async (rescheduleData: RescheduleType) => {
    try {
      const response = await api.post(`${API_ROUTES.BOOKINGS}/${rescheduleData.bookingId}/reschedule`, rescheduleData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });

      // Fetch updated booking data
      await fetchBookingById(rescheduleData.bookingId);
      toast.success('Booking rescheduled successfully!');
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to reschedule booking';
      toast.error(errorMessage);
      throw err;
    }
  }, [dispatch, fetchBookingById]);

  // Check availability
  const checkAvailability = useCallback(async (searchData: AvailabilitySearchType) => {
    dispatch(checkAvailabilityStart());
    try {
      const response = await api.post('/availability/check', searchData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });

      const availabilityData = response.data?.data || response.data;
      dispatch(checkAvailabilitySuccess(availabilityData));
      return availabilityData;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to check availability';
      dispatch(checkAvailabilityFailure(errorMessage));
      toast.error(errorMessage);
      throw err;
    }
  }, [dispatch]);

  // Process payment
  const processPayment = useCallback(async (bookingId: string, paymentData: any) => {
    try {
      const response = await api.post(`${API_ROUTES.BOOKINGS}/${bookingId}/payment`, paymentData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });

      // Update booking status to confirmed after payment
      dispatch(updateBookingStatusSuccess({ bookingId, status: 'confirmed' }));
      toast.success('Payment processed successfully!');
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to process payment';
      toast.error(errorMessage);
      throw err;
    }
  }, [dispatch]);

  // Submit vendor quote for requirement
  const submitVendorQuote = useCallback(async (requirementId: string, quoteData: any) => {
    try {
      const response = await api.post(`${API_ROUTES.BOOKINGS}/requirements/${requirementId}/quotes`, quoteData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      return response.data?.data || response.data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to submit quote';
      throw new Error(errorMessage);
    }
  }, []);

  // Get vendor requirements
  const getVendorRequirements = useCallback(async (page = 1, limit = 10, filters = {}) => {
    try {
      const params: any = {
        page,
        limit,
        ...filters,
      };
      
      const response = await api.get(`${API_ROUTES.BOOKINGS}/requirements`, {
        params,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      return response.data?.data || response.data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to fetch requirements';
      throw new Error(errorMessage);
    }
  }, []);

  // Submit quotation
  const submitQuotation = useCallback(async (quotationData: any) => {
    try {
      const response = await api.post(`${API_ROUTES.QUOTATIONS}`, quotationData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const quotationResponse = response.data?.data || response.data;
      toast.success('Quotation submitted successfully!');
      return quotationResponse;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to submit quotation';
      toast.error(errorMessage);
      throw err;
    }
  }, [toast]);

  return {
    getBookingList,
    fetchBookingById,
    addBooking,
    updateBooking,
    removeBooking,
    updateBookingStatus,
    cancelBooking,
    rescheduleBooking,
    checkAvailability,
    processPayment,
    submitVendorQuote,
    getVendorRequirements,
    submitQuotation,
  };
}