import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import api from '../../../axios';
import { fetchEnterprisesStart, fetchEnterprisesSuccess, fetchEnterprisesFailure, addEnterpriseStart, addEnterpriseSuccess, addEnterpriseFailure, removeEnterpriseStart, removeEnterpriseSuccess, removeEnterpriseFailure, updateEnterpriseStart , updateEnterpriseSuccess, updateEnterpriseFailure, fetchEnterpriseByIdStart, fetchEnterpriseByIdSuccess, fetchEnterpriseByIdFailure, fetchEnterpriseStart, fetchEnterpriseSuccess, fetchEnterpriseFailure, resetPasswordStart, resetPasswordSuccess, resetPasswordFailure } from '../slices/enterpriseSlice';
import { API_ROUTES } from '../../../constants/routes';
import type { EnterpriseSchemaType } from '../schemas/enterprise.schema';

export function useEnterpriseActions() {
  const dispatch = useDispatch();

  const getEnterpriseList = useCallback(
    async (page = 1, limit = 10, searchQuery = '') => {
      dispatch(fetchEnterprisesStart());
      try {
        const response = await api.get(`${API_ROUTES.GET_ALL_ENTERPRISES}`, {
          params: {
            page,
            limit,
            search: searchQuery,
          },
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
  
        const { data, pagination } = response.data.data;
        dispatch(fetchEnterprisesSuccess({ enterprises: data, pagination }));
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || 'Failed to fetch enterprises';
        dispatch(fetchEnterprisesFailure(errorMessage));
      }
    },
    [dispatch]
  );


  const removeEnterprise = useCallback(async (_id: string) => {
    dispatch(removeEnterpriseStart());
    try {
      const response = await api.delete(`${API_ROUTES.GET_ALL_ENTERPRISES}/${_id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`, // if token is needed
        },
      });

      dispatch(removeEnterpriseSuccess(_id)); // assuming response.data is an array of users
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to remove user';
      dispatch(removeEnterpriseFailure(errorMessage));
    }
  }, [dispatch]);

  const addEnterprise = useCallback(async (data: EnterpriseSchemaType) => {
    dispatch(addEnterpriseStart());
    try {
      // Make a POST request to your authentication endpoint using axios
      const response = await api.post(`${API_ROUTES.GET_ALL_ENTERPRISES}`, {
        ...data,
      }, {
        headers: {
          'Content-Type': 'application/json',
          // Add any additional headers if required, e.g., Authorization, etc.
        }
      });

      // Assume the API returns a token or user info in response.data
      const token = response.data.token; // Adjust according to your API response

      // Dispatch success action with the token (or user info)
      dispatch(addEnterpriseSuccess(token));
    } catch (err: any) {
      // Handle errors (network issues, invalid credentials, etc.)
      // Axios error messages can be in err.response?.data?.message
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Invalid credentials';
      dispatch(addEnterpriseFailure(errorMessage));
      // Re-throw the error so it can be caught by the form's try-catch
      throw err;
    }
  }, [dispatch]);

  const updateEnterprise = useCallback(
    async (
      id: string,
      data: EnterpriseSchemaType
    ) => {
      dispatch(updateEnterpriseStart());
      try {
        const response = await api.put(`${API_ROUTES.GET_ALL_ENTERPRISES}/${id}`, {
          ...data,
        });
        dispatch(updateEnterpriseSuccess(response.data));
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || 'Update failed';
        dispatch(updateEnterpriseFailure(errorMessage));
        // Re-throw the error so it can be caught by the form's try-catch
        throw err;
      }
    },
    [dispatch]
  );

  const fetchEnterpriseById = useCallback(async (_id: string) => {
    dispatch(fetchEnterpriseByIdStart());
  
    try {
      const response = await api.get(`${API_ROUTES.GET_ALL_ENTERPRISES}/${_id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
     dispatch(fetchEnterpriseByIdSuccess(response.data.data));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to fetch user';
      dispatch(fetchEnterpriseByIdFailure(errorMessage));
    }
  }, [dispatch]);

  const fetchFeatures = useCallback(async () => {
    dispatch(fetchEnterpriseStart());
    try {
      const response = await api.get(`${API_ROUTES.GET_ALL_FEATURES}?page=1&limit=1000`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      dispatch(fetchEnterpriseSuccess(response.data.data.data));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to fetch roles';
      dispatch(fetchEnterpriseFailure(errorMessage));
    }
  }, [dispatch]);

  const resetPassword = useCallback(async (newPassword: string, token: string) => {
    dispatch(resetPasswordStart());
    try {
      const response = await api.patch(`${API_ROUTES.GET_ALL_ENTERPRISES}/reset-password/${token}`, {
        password: newPassword,
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      dispatch(resetPasswordSuccess(response.data.data.accessToken));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Invalid credentials';
      dispatch(resetPasswordFailure(errorMessage));
    }
  }, [dispatch]);

  const resetEnterprisePassword = useCallback(async (email: string) => {
    try {
      const payload: any = {
        email,
      };
      const response = await api.post(`${API_ROUTES.GET_ALL_ENTERPRISES}/resend-reset-link`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 
        err.response?.data?.error || 
        err.message || 
        'Failed to reset password';
      throw new Error(errorMessage);
    }
  }, []);

  const updateEnterpriseStatus = useCallback(async (enterpriseId: string, isActive: boolean) => {
    try {
      const response = await api.patch(`${API_ROUTES.GET_ALL_ENTERPRISE_USERS}/${enterpriseId}/status`, {
        isActive
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to update enterprise status';
      throw new Error(errorMessage);
    }
  }, []);
 
  return { getEnterpriseList, addEnterprise, removeEnterprise, updateEnterprise, fetchEnterpriseById, fetchFeatures, resetPassword, resetEnterprisePassword, updateEnterpriseStatus };
}
