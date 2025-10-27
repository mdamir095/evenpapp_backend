import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import api from '../../../axios';
import {
  fetchContentPoliciesStart,
  fetchContentPoliciesSuccess,
  fetchContentPoliciesFailure,
  addContentPolicyStart,
  addContentPolicySuccess,
  addContentPolicyFailure,
  removeContentPolicyStart,
  removeContentPolicySuccess,
  removeContentPolicyFailure,
  updateContentPolicyStart,
  updateContentPolicySuccess,
  updateContentPolicyFailure,
  fetchContentPolicyByIdStart,
  fetchContentPolicyByIdSuccess,
  fetchContentPolicyByIdFailure,
} from '../slices/contentPolicySlice';
import { API_ROUTES } from '../../../constants/routes';

// API configuration
const getApiHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export function useContentPolicyActions() {
  const dispatch = useDispatch();

  const getContentPolicyList = useCallback(
    async (page = 1, limit = 10, searchQuery = '') => {
      dispatch(fetchContentPoliciesStart());
      try {
        const response = await api.get(API_ROUTES.CONTENT_POLICIES, {
          params: {
            title: searchQuery, 
            page,
            limit,
          },
          headers: getApiHeaders(),
        });
  
        const { data, pagination } = response.data.data;
        dispatch(fetchContentPoliciesSuccess({ contentPolicies: data, pagination }));
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || 'Failed to fetch content policies';
        dispatch(fetchContentPoliciesFailure(errorMessage));
      }
    },
    [dispatch]
  );
  

  const removeContentPolicy = useCallback(
    async (id: string) => {
      dispatch(removeContentPolicyStart());
      try {
        await api.delete(`${API_ROUTES.CONTENT_POLICIES}/${id}`, {
          headers: getApiHeaders(),
        });
        dispatch(removeContentPolicySuccess(id));
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || 'Delete failed';
        dispatch(removeContentPolicyFailure(errorMessage));
      }
    },
    [dispatch]
  );

  const addContentPolicy = useCallback(async (
    title: string, 
    content: string, 
    effectiveDate: string, 
    category: string
  ) => {
    dispatch(addContentPolicyStart());
    try {
      const response = await api.post(API_ROUTES.CONTENT_POLICIES, {
        title,
        content,
        effectiveDate,
        category,
      }, {
        headers: getApiHeaders(),
      });

      dispatch(addContentPolicySuccess(response.data.data));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Add failed';
      dispatch(addContentPolicyFailure(errorMessage));
      throw err; // Re-throw to handle in component
    }
  }, [dispatch]);

  const updateContentPolicy = useCallback(
    async (
      id: string,
      title: string,
      content: string,
      effectiveDate: string,
      category: string
    ) => {
      dispatch(updateContentPolicyStart());
      try {
        const response = await api.put(`${API_ROUTES.CONTENT_POLICIES}/${id}`, {
          title,
          content,
          effectiveDate,
          category,
        }, {
          headers: getApiHeaders(),
        });

        dispatch(updateContentPolicySuccess(response.data.data));
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || 'Update failed';
        dispatch(updateContentPolicyFailure(errorMessage));
        throw err; // Re-throw to handle in component
      }
    },
    [dispatch]
  );

  const fetchContentPolicyById = useCallback(async (_id: string) => {
    dispatch(fetchContentPolicyByIdStart());
  
    try {
      const response = await api.get(`${API_ROUTES.CONTENT_POLICIES}/${_id}`, {
        headers: getApiHeaders(),
      });
  
      dispatch(fetchContentPolicyByIdSuccess(response.data.data));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to fetch content policy';
      dispatch(fetchContentPolicyByIdFailure(errorMessage));
    }
  }, [dispatch]);

  const fetchContentPolicyByCategory = useCallback(async (category: string) => {
    dispatch(fetchContentPolicyByIdStart());
  
    try {
      const response = await api.get(`${API_ROUTES.CONTENT_POLICIES}/category/${category}`, {
        headers: getApiHeaders(),
      });
  
      dispatch(fetchContentPolicyByIdSuccess(response.data.data));
      return response.data.data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to fetch content policy by category';
      dispatch(fetchContentPolicyByIdFailure(errorMessage));
      throw err;
    }
  }, [dispatch]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get(`${API_ROUTES.CONTENT_POLICIES}/categories`, {
        headers: getApiHeaders(),
      });
      // Backend returns: { categories: Array<{ key: string; value: string }> }
      return response.data.data.categories as Array<{ key: string; value: string }>;
    } catch (err: any) {
      // Fallback to default key/value pairs
      return [
        { key: 'privacy-policy', value: 'Privacy Policy' },
        { key: 'terms-of-service', value: 'Terms of Service' },
        { key: 'cookie-policy', value: 'Cookie Policy' },
        { key: 'data-protection', value: 'Data Protection' },
        { key: 'user-agreement', value: 'User Agreement' },
        { key: 'about-us', value: 'About Us' },
      ];
    }
  }, []);

  return {
    getContentPolicyList,
    removeContentPolicy,
    addContentPolicy,
    updateContentPolicy,
    fetchContentPolicyById,
    fetchContentPolicyByCategory,
    fetchCategories,
  };
}
