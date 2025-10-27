import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import api from '../../../axios';
import {
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
} from '../slices/VendorCategorySlice';
import { API_ROUTES } from '../../../constants/routes';

export function useVendorCategoryActions() {
  const dispatch = useDispatch();

  const getVendorCategoryList = useCallback(
    async (page = 1, limit = 10, searchQuery = '') => {
      dispatch(fetchVendorCategoriesStart());
      try {
        const response = await api.get(API_ROUTES.VENDOR_CATEGORIES, {
          params: {
            name: searchQuery, 
            page,
            limit,
          },
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
  
        // Destructure response if backend format is { data: { data, pagination } }
        const { data, pagination } = response.data.data;
  
        dispatch(fetchVendorCategoriesSuccess({ vendorCategories: data, pagination }));
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || 'Failed to fetch vendor categories';
        dispatch(fetchVendorCategoriesFailure(errorMessage));
      }
    },
    [dispatch]
  );
  

  const removeVendorCategory = useCallback(async (id: string) => {
    dispatch(removeVendorCategoryStart());
    try {
      await api.delete(`${API_ROUTES.VENDOR_CATEGORIES}/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      dispatch(removeVendorCategorySuccess(id));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 
        err.response?.data?.error ||
        err.message || 
        'Failed to remove vendor category';
      dispatch(removeVendorCategoryFailure(errorMessage));
      throw err;
    }
  }, [dispatch]);

  const addVendorCategory = useCallback(async (
    name: string,
    description: string,
    formId?: string,
  ) => {
    dispatch(addVendorCategoryStart());
    try {
      const response = await api.post(
        API_ROUTES.VENDOR_CATEGORIES,
        { name, description, formId },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      dispatch(addVendorCategorySuccess(response.data.data || response.data));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 
        err.response?.data?.error ||
        err.message || 
        'Failed to add vendor category';
      dispatch(addVendorCategoryFailure(errorMessage));
      throw err;
    }
  }, [dispatch]);
  
  const updateVendorCategory = useCallback(async (
    id: string,
    name: string,
    description: string,
    formId?: string,
  ) => {
    dispatch(updateVendorCategoryStart());
    try {
      const response = await api.put(
        `${API_ROUTES.VENDOR_CATEGORIES}/${id}`,
        { name, description, formId },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      dispatch(updateVendorCategorySuccess(response.data.data || response.data));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 
        err.response?.data?.error ||
        err.message || 
        'Failed to update vendor category';
      dispatch(updateVendorCategoryFailure(errorMessage));
      throw err;
    }
  }, [dispatch]);
  

  const fetchVendorCategoryById = useCallback(async (_id: string) => {
    dispatch(fetchVendorCategoryByIdStart());
    try {
      const response = await api.get(`${API_ROUTES.VENDOR_CATEGORIES}/${_id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      dispatch(fetchVendorCategoryByIdSuccess(response.data.data));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to fetch vendor category';
      dispatch(fetchVendorCategoryByIdFailure(errorMessage));
    }
  }, [dispatch]);

  const getAllForms = useCallback(async () => {
    try {
      const response = await api.get(`${API_ROUTES.GET_ALL_FORMS}?type=vendor-service`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = response.data.data.data || response.data;
      // Ensure we always return an array
      return Array.isArray(data) ? response.data.data.data : [];
    } catch (err: any) {
      // Failed to fetch forms
      return [];
    }
  }, []);

  const updateVendorCategoryStatus = useCallback(async (id: string, status: any) => {
    dispatch(updateVendorCategoryStatusStart());
    try {
      const response = await api.patch(`${API_ROUTES.VENDOR_CATEGORIES}/${id}/status`, status, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      dispatch(updateVendorCategoryStatusSuccess(response.data.data));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 
        err.response?.data?.error ||
        err.message || 
        'Failed to update vendor category status';
      dispatch(updateVendorCategoryStatusFailure(errorMessage));
      throw err;
    }
  }, [dispatch]);

  return {
    getVendorCategoryList,
    addVendorCategory,
    removeVendorCategory,
    updateVendorCategory,
    fetchVendorCategoryById,
    getAllForms,
    updateVendorCategoryStatus,
  };
}
