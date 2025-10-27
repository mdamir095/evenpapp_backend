import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import api from '../../../axios';
import {
  fetchVendorsStart,
  fetchVendorsSuccess,
  fetchVendorsFailure,
  addVendorStart,
  addVendorSuccess,
  addVendorFailure,
  removeVendorStart,
  removeVendorSuccess,
  removeVendorFailure,
  updateVendorStart,
  updateVendorSuccess,
  updateVendorFailure,
  fetchVendorByIdStart,
  fetchVendorByIdSuccess,
  fetchVendorByIdFailure,
} from '../slices/VendorSlice';
import { API_ROUTES } from '../../../constants/routes';
import type { VendorFormData, DynamicForm } from '../../../types/Vendor';

export function useVendorActions() {
  const dispatch = useDispatch();

  const getVendorList = useCallback(
    async (page = 1, limit = 10, searchQuery = '') => {
      dispatch(fetchVendorsStart());
      try {
        const response = await api.get(API_ROUTES.VENDORS, {
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
  
        // Handle different response formats
        let vendors = [];
        let pagination = null;
        
        if (response.data.data) {
          // Format: { data: { data: [], pagination: {} } }
          vendors = Array.isArray(response.data.data.data) ? response.data.data.data : [];
          pagination = response.data.data.pagination || null;
        } else if (Array.isArray(response.data)) {
          // Format: { data: [] }
          vendors = response.data;
        } else {
          // Fallback
          vendors = [];
        }
  
        dispatch(fetchVendorsSuccess({ vendors, pagination }));
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || 'Failed to fetch vendors';
        dispatch(fetchVendorsFailure(errorMessage));
      }
    },
    [dispatch]
  );

  const removeVendor = useCallback(async (id: string) => {
    dispatch(removeVendorStart());
    try {
      await api.delete(`${API_ROUTES.VENDORS}/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      dispatch(removeVendorSuccess(id));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to remove vendor';
      dispatch(removeVendorFailure(errorMessage));
    }
  }, [dispatch]);

  const addVendor = useCallback(async (vendorData: VendorFormData | FormData) => {
    dispatch(addVendorStart());
    try {
      // Determine if we're sending FormData (for binary uploads) or JSON
      const isFormData = vendorData instanceof FormData;
      
      const response = await api.post(
        API_ROUTES.VENDORS,
        vendorData,
        {
          headers: {
            'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      dispatch(addVendorSuccess(response.data.data || response.data));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to add vendor';
      dispatch(addVendorFailure(errorMessage));
    }
  }, [dispatch]);
  
  const updateVendor = useCallback(async (
    id: string,
    vendorData: VendorFormData | FormData
  ) => {
    dispatch(updateVendorStart());
    try {
      // Determine if we're sending FormData (for binary uploads) or JSON
      const isFormData = vendorData instanceof FormData;
      
      const response = await api.patch(
        `${API_ROUTES.VENDORS}/${id}`,
        vendorData,
        {
          headers: {
            'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      dispatch(updateVendorSuccess(response.data.data || response.data));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to update vendor';
      dispatch(updateVendorFailure(errorMessage));
    }
  }, [dispatch]);

  const fetchVendorById = useCallback(async (_id: string) => {
    dispatch(fetchVendorByIdStart());
    try {
      const response = await api.get(`${API_ROUTES.VENDORS}/${_id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      dispatch(fetchVendorByIdSuccess(response.data.data || response.data));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to fetch vendor';
      dispatch(fetchVendorByIdFailure(errorMessage));
    }
  }, [dispatch]);

  const getServiceCategories = useCallback(async () => {
    try {
      const response = await api.get(`${API_ROUTES.SERVICE_CATEGORIES}/user?page=1&limit=100`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data.data?.data || response.data.data || response.data;
    } catch (err: any) {
      // Failed to fetch service categories
      return [];
    }
  }, []);

  const getDynamicFormByCategory = useCallback(async (categoryId: string): Promise<DynamicForm | null> => {
    try {
      const response = await api.get(`${API_ROUTES.SERVICE_CATEGORIES}/user/${categoryId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      const data = response.data.data;
      
      if (data && data.form && data.form.fields) {
        const formData = data.form;
        
        const dynamicForm = {
          id: formData.id,
          formId: data.formId,
          name: formData.name,
          description: formData.description,
          key: formData.key,
          createdAt: formData.createdAt,
          updatedAt: formData.updatedAt,
          fields: formData.fields.map((field: any) => {
            const processedField = {
              ...field, // Keep all original field properties
              // Add computed properties for UI
              label: field.metadata?.label || field.name,
              type: field.type === 'dropdown' ? 'select' : field.type, // Map dropdown to select
              required: field.validation?.required?.value || false,
              placeholder: field.metadata?.placeholder || '',
              options: field.metadata?.options ? field.metadata.options.map((option: string) => ({
                label: option,
                value: option
              })) : []
            };
            return processedField;
          })
        };
        
        return dynamicForm;
      }
      
      return null;
    } catch (err: any) {
      return null;
    }
  }, []);

  return {
    getVendorList,
    addVendor,
    removeVendor,
    updateVendor,
    fetchVendorById,
    getServiceCategories,
    getDynamicFormByCategory,
  };
}
