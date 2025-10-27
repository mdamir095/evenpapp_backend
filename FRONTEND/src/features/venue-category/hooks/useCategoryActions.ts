import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import api from '../../../axios';
import {
  fetchCategoryStart,
  fetchCategorySuccess,
  fetchCategoryFailure,
  addCategoryStart,
  addCategorySuccess,
  addCategoryFailure,
  removeCategoryStart,  
  removeCategorySuccess,
  removeCategoryFailure,
  updateCategoryStart,
  updateCategorySuccess,
  updateCategoryFailure,
  fetchCategoryByIdStart,
  fetchCategoryByIdSuccess,
  fetchCategoryByIdFailure,
} from '../slices/venueCategorySlice';
import { API_ROUTES } from '../../../constants/routes';
import type { VenueCategorySchemaType } from '../schemas/category.schema';
import { updateVendorCategoryStatusFailure, updateVendorCategoryStatusSuccess } from '../../vendorCategory/slices/VendorCategorySlice';

export function useCategoryActions() {
  const dispatch = useDispatch();

  const getCategoryList = useCallback(
    async (page = 1, limit = 10, searchQuery = '') => {
      dispatch(fetchCategoryStart());
      try {
        const response = await api.get(API_ROUTES.VENUE_CATEGORIES, {
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
  
        dispatch(fetchCategorySuccess({ categories: data, pagination }));
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || 'Failed to fetch categories';
        dispatch(fetchCategoryFailure(errorMessage));
      }
    },
    [dispatch]
  );
  

  const removeCategory = useCallback(async (id: string) => {
    dispatch(removeCategoryStart());
    try {
      await api.delete(`${API_ROUTES.VENUE_CATEGORIES}/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      dispatch(removeCategorySuccess(id));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to remove role';
      dispatch(removeCategoryFailure(errorMessage));
    }
  }, [dispatch]);

  const addCategory = useCallback(async (
    data: VenueCategorySchemaType,
  ) => {
    dispatch(addCategoryStart());
    try {
      const response = await api.post(
        API_ROUTES.VENUE_CATEGORIES,
       {
        ...data,
      },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      dispatch(addCategorySuccess(response.data));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to add role';
      dispatch(addCategoryFailure(errorMessage));
    }
  }, [dispatch]);
  
  const updateCategory = useCallback(async (
    id: string,
    data: VenueCategorySchemaType
  ) => {
    dispatch(updateCategoryStart());
    try {
      const response = await api.put(
        `${API_ROUTES.VENUE_CATEGORIES}/${id}`,
        {
          ...data,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      dispatch(updateCategorySuccess(response.data));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to update role';
      dispatch(updateCategoryFailure(errorMessage));
    }
  }, [dispatch]);
  

  const fetchCategoryById = useCallback(async (_id: string) => {
    dispatch(fetchCategoryByIdStart());
    try {
      const response = await api.get(`${API_ROUTES.VENUE_CATEGORIES}/${_id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      dispatch(fetchCategoryByIdSuccess(response.data.data));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to fetch venue category';
      dispatch(fetchCategoryByIdFailure(errorMessage));
    }
  }, [dispatch]);
  
  const updateVenueCategoryStatus = useCallback(async (id: string, status: any) => {
    dispatch(updateCategoryStart());
    try {
      const response = await api.patch(`${API_ROUTES.VENUE_CATEGORIES}/${id}/status`, status, {
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
    getCategoryList,
    addCategory,
    removeCategory,
    updateCategory,
    fetchCategoryById,
    updateVenueCategoryStatus,
  };
}
