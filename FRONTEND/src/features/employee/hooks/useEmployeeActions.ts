import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import api from '../../../axios';
import { fetchEmployeesStart, fetchEmployeesSuccess, fetchEmployeesFailure, addEmployeeStart, addEmployeeSuccess, addEmployeeFailure, removeEmployeeStart, removeEmployeeSuccess, removeEmployeeFailure, updateEmployeeStart , updateEmployeeSuccess, updateEmployeeFailure, fetchEmployeeByIdStart, fetchEmployeeByIdSuccess, fetchEmployeeByIdFailure, fetchFeaturesStart, fetchFeaturesSuccess, fetchFeaturesFailure } from '../slices/employeeSlice';
import { API_ROUTES } from '../../../constants/routes';

export function useEmployeeActions() {
  const dispatch = useDispatch();

  const getEmployeeList = useCallback(
    async (page = 1, limit = 10, searchQuery = '', selectedEnterprise = '') => {
      dispatch(fetchEmployeesStart());
      try {
        const params: any = {
          page,
          limit,
          search: searchQuery,
        };
        
        // Add enterprise filter if provided
        if (selectedEnterprise) {
          params.enterpriseId = selectedEnterprise;
        }
        
        const response = await api.get(`${API_ROUTES.GET_ALL_EMPLOYEES}`, {
          params,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
  
        const { data, pagination } = response.data.data;
        dispatch(fetchEmployeesSuccess({ employees: data, pagination }));
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || 'Failed to fetch employees';
        dispatch(fetchEmployeesFailure(errorMessage));
      }
    },
    [dispatch]
  );

  const removeEmployee = useCallback(async (_id: string) => {
    dispatch(removeEmployeeStart());
    try {
      await api.delete(`${API_ROUTES.GET_ALL_EMPLOYEES}/${_id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      dispatch(removeEmployeeSuccess(_id));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to remove employee';
      dispatch(removeEmployeeFailure(errorMessage));
    }
  }, [dispatch]);

  const addEmployee = useCallback(async (data: any) => {
    dispatch(addEmployeeStart());
    try {
      // Get user data to check if enterprise ID needs to be sent
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const submissionData = { ...data };
      
      // If user has enterprise ID (enterprise user), add it to submission data
      if (userData.enterpriseId && !submissionData.enterpriseId) {
        submissionData.enterpriseId = userData.enterpriseId;
      }
      
      const response = await api.post(`${API_ROUTES.GET_ALL_EMPLOYEES}`, submissionData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const employeeData = response.data?.data || response.data;
      dispatch(addEmployeeSuccess(employeeData));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to create employee';
      dispatch(addEmployeeFailure(errorMessage));
      throw err;
    }
  }, [dispatch]);

  const updateEmployee = useCallback(
    async (
      id: string,
      data: any
    ) => {
      dispatch(updateEmployeeStart());
      try {
        // Get user data to check if enterprise ID needs to be sent
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        
        const payload: any = {
          id,
          ...data,
        };
        
        // If user has enterprise ID (enterprise user), add it to payload
        if (userData.enterpriseId && !payload.enterpriseId) {
          payload.enterpriseId = userData.enterpriseId;
        }
        
        if (data.password) {
          payload.password = data.password;
        }

        const response = await api.put(`${API_ROUTES.GET_ALL_EMPLOYEES}/${id}`, payload);

        dispatch(updateEmployeeSuccess(response.data));
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || 'Update failed';
        dispatch(updateEmployeeFailure(errorMessage));
        throw err;
      }
    },
    [dispatch]
  );

  const fetchEmployeeById = useCallback(async (_id: string) => {
    dispatch(fetchEmployeeByIdStart());
  
    try {
      const response = await api.get(`${API_ROUTES.GET_ALL_EMPLOYEES}/${_id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      dispatch(fetchEmployeeByIdSuccess(response.data.data));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to fetch employee';
      dispatch(fetchEmployeeByIdFailure(errorMessage));
    }
  }, [dispatch]);

  const fetchEnterpriseUserById = useCallback(async (_id: string) => {
    console.log('🔄 fetchEnterpriseUserById called with ID:', _id);
    console.log('🔄 API URL:', `${API_ROUTES.GET_ALL_ENTERPRISES}/users/${_id}`);
    
    dispatch(fetchEmployeeByIdStart());
  
    try {
      const response = await api.get(`${API_ROUTES.GET_ALL_ENTERPRISES}/users/${_id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      console.log('✅ Enterprise user API response:', response.data);
      dispatch(fetchEmployeeByIdSuccess(response.data.data));
    } catch (err: any) {
      console.error('❌ Enterprise user API error:', err);
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to fetch enterprise user';
      dispatch(fetchEmployeeByIdFailure(errorMessage));
    }
  }, [dispatch]);

  const fetchFeatures = useCallback(async () => {
    dispatch(fetchFeaturesStart());
    try {
      // Get user data to check if enterprise ID needs to be sent
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const params: any = {};
      
      // If user has enterprise ID (enterprise user), send it as query parameter
      if (userData.enterpriseId) {
        params.enterpriseId = userData.enterpriseId;
      }
      
      const response = await api.get(`admin/enterprises/features`, {
        params,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      const featuresData = response.data?.data?.data || response.data?.data || response.data || [];
      dispatch(fetchFeaturesSuccess(featuresData.features));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 
        err.response?.data?.error || 
        err.message || 
        'Failed to fetch features';
      dispatch(fetchFeaturesFailure(errorMessage));
      throw err;
    }
  }, [dispatch]);

  const getEnterpriseList = useCallback(async () => {
    const response = await api.get(`${API_ROUTES.GET_ALL_ENTERPRISES}/list`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data.data;
  }, []);

  const getEnterpriseFeatures = useCallback(async (enterpriseId: string) => {
    const response = await api.get(`${API_ROUTES.GET_ALL_ENTERPRISES}/features`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      params: {
        enterpriseId,
      },
    });
   return response.data.data.features;
  }, []);

  const resetEmployeePassword = useCallback(async (email: string) => {
    try {
      const payload: any = {
        email,
      };
      const response = await api.post(`${API_ROUTES.GET_ALL_EMPLOYEES}/resend-reset-link`, payload, {
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

  const updateEmployeeStatus = useCallback(async (employeeId: string, isActive: boolean) => {
    try {
      const response = await api.patch(`${API_ROUTES.GET_ALL_USERS}/${employeeId}/status`, {
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
        'Failed to update employee status';
      throw new Error(errorMessage);
    }
  }, []);

  const blockEmployee = useCallback(async (employeeId: string, blockValue: any) => {
    try {
      const response = await api.patch(`${API_ROUTES.GET_ALL_USERS}/${employeeId}/block`, blockValue, {
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
        'Failed to block employee';
      throw new Error(errorMessage);
    }
  }, []);
 
  return { getEmployeeList, addEmployee, removeEmployee, updateEmployee, fetchEmployeeById, fetchEnterpriseUserById, fetchFeatures, getEnterpriseList, getEnterpriseFeatures, resetEmployeePassword, updateEmployeeStatus, blockEmployee };
}
