import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import api from '../../../axios';
import {
  fetchCategoriesStart,
  fetchCategoriesSuccess,
  fetchCategoriesFailure,
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
} from '../slices/ServiceCategorySlice';
import { API_ROUTES } from '../../../constants/routes';
import { updateVendorCategoryStatusFailure, updateVendorCategoryStatusSuccess } from '../../vendorCategory/slices/VendorCategorySlice';

export function useServiceCategoryActions() {
  const dispatch = useDispatch();

  const getCategoryList = useCallback(
    async (page = 1, limit = 10, searchQuery = '') => {
      dispatch(fetchCategoriesStart());
      try {
        const response = await api.get(API_ROUTES.GET_ALL_CATEGORIES, {
          params: {
            search: searchQuery, 
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
  
        dispatch(fetchCategoriesSuccess({ categories: data, pagination }));
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || 'Failed to fetch categories';
        dispatch(fetchCategoriesFailure(errorMessage));
      }
    },
    [dispatch]
  );
  

  const removeCategory = useCallback(async (id: string) => {
    dispatch(removeCategoryStart());
    try {
      await api.delete(`${API_ROUTES.GET_ALL_CATEGORIES}/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      dispatch(removeCategorySuccess(id));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 
        err.response?.data?.error ||
        err.message || 
        'Failed to remove category';
      dispatch(removeCategoryFailure(errorMessage));
      throw err;
    }
  }, [dispatch]);

  const addCategory = useCallback(async (
    name: string,
    description: string,
    formId?: string,
  ) => {
    dispatch(addCategoryStart());
    const requestData = { name, description, formId };
    console.log('=== ADD CATEGORY DEBUG ===');
    console.log('Request data:', requestData);
    console.log('formId value:', formId);
    console.log('formId type:', typeof formId);
    console.log('formId in requestData:', requestData.formId);
    console.log('JSON.stringify(requestData):', JSON.stringify(requestData));
    console.log('================================');
    
    try {
      const response = await api.post(
        API_ROUTES.GET_ALL_CATEGORIES,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      console.log('Add category response:', response.data);
      dispatch(addCategorySuccess(response.data.data || response.data));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 
        err.response?.data?.error ||
        err.message || 
        'Failed to add category';
      dispatch(addCategoryFailure(errorMessage));
      throw err;
    }
  }, [dispatch]);
  
    const updateCategory = useCallback(async (
    id: string,
    name: string,
    description: string,
    formId?: string,
  ) => {
    dispatch(updateCategoryStart());
    const requestData = { name, description, formId };
    console.log('Updating category with data:', requestData); // Debug log
    try {
      const response = await api.put(
        `${API_ROUTES.GET_ALL_CATEGORIES}/${id}`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        }
      );
      console.log('Update category response:', response.data); // Debug log
      dispatch(updateCategorySuccess(response.data.data || response.data));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 
        err.response?.data?.error ||
        err.message || 
        'Failed to update category';
      dispatch(updateCategoryFailure(errorMessage));
      throw err;
    }
  }, [dispatch]);
  

  const fetchCategoryById = useCallback(async (_id: string) => {
    dispatch(fetchCategoryByIdStart());
    try {
      const response = await api.get(`${API_ROUTES.GET_ALL_CATEGORIES}/${_id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      dispatch(fetchCategoryByIdSuccess(response.data.data));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to fetch feature';
      dispatch(fetchCategoryByIdFailure(errorMessage));
    }
  }, [dispatch]);

  const updateServiceCategoryStatus = useCallback(async (id: string, status: any) => {
    dispatch(updateCategoryStart());
    try {
      const response = await api.patch(`${API_ROUTES.GET_ALL_CATEGORIES}/${id}/status`, status, {
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

  const getFormsList = useCallback(async () => {
    try {
      const response = await api.get(API_ROUTES.GET_ALL_FORMS, {
        params: {
          page: 1,
          limit: 100,
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      console.log('Forms API response:', response.data); // Debug log
      return response.data?.data?.data || [];
    } catch (err: any) {
      console.error('Failed to fetch forms:', err);
      return [];
    }
  }, []);

  return {
    getCategoryList,
    addCategory,
    removeCategory,
    updateCategory,
    fetchCategoryById,
    updateServiceCategoryStatus,
    getFormsList,
  };
}
