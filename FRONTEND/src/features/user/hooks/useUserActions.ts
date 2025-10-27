import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import api from '../../../axios';
import { fetchUsersStart, fetchUsersSuccess, fetchUsersFailure, addUserStart, addUserSuccess, addUserFailure, removeUserStart, removeUserSuccess, removeUserFailure, updateUserStart , updateUserSuccess, updateUserFailure, fetchUserByIdStart, fetchUserByIdSuccess, fetchUserByIdFailure, fetchRolesStart, fetchRolesSuccess, fetchRolesFailure, fetchFeaturesStart, fetchFeaturesSuccess, fetchFeaturesFailure } from '../slices/userSlice';
import { API_ROUTES } from '../../../constants/routes';

export function useUserActions() {
  const dispatch = useDispatch();

  const getUserList = useCallback(
    async (page = 1, limit = 10, searchQuery = '', roleName = '') => {
      dispatch(fetchUsersStart());
      try {
        const response = await api.get(API_ROUTES.GET_ALL_USERS, {
          params: {
            page,
            limit,
            search: searchQuery,
            roleName,
          },
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
  
        const { data, pagination } = response.data.data;
        dispatch(fetchUsersSuccess({ users: data, pagination }));
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || 'Failed to fetch users';
        dispatch(fetchUsersFailure(errorMessage));
      }
    },
    [dispatch]
  );


  const removeUser = useCallback(async (_id: string) => {
    dispatch(removeUserStart());
    try {
      const response = await api.delete(`${API_ROUTES.GET_ALL_USERS}/${_id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`, // if token is needed
        },
      });

      dispatch(removeUserSuccess(_id)); // assuming response.data is an array of users
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to remove user';
      dispatch(removeUserFailure(errorMessage));
    }
  }, [dispatch]);

  const addUser = useCallback(async (firstName: string, lastName: string, email: string, organizationName: string, countryCode: string, phoneNumber: string, isActive: boolean, isEmailVerified: boolean, features: any[]) => {
    dispatch(addUserStart());
    try {
      // Make a POST request to your authentication endpoint using axios
      const response = await api.post(`${API_ROUTES.GET_ALL_USERS}`, {
        firstName,
        lastName,
        email,
        organizationName,
        countryCode,
        phoneNumber,
        isActive: String(isActive),        
        isEmailVerified: String(isEmailVerified), 
        features, // ✅ Changed from roleIds to features
      }, {
        headers: {
          'Content-Type': 'application/json',
          // Add any additional headers if required, e.g., Authorization, etc.
        }
      });

      // ✅ Handle different possible response structures  
      const userData = response.data?.data || response.data;

      // Dispatch success action with the user data
      dispatch(addUserSuccess(userData));
    } catch (err: any) {
      // Handle errors (network issues, invalid credentials, etc.)
      // Axios error messages can be in err.response?.data?.message
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to create user';
      dispatch(addUserFailure(errorMessage));
      throw err; // ✅ Re-throw error for form handling
    }
  }, [dispatch]);

  const updateUser = useCallback(
    async (
      id: string,
      firstName: string,
      lastName: string,
      email: string,
      organizationName: string,
      countryCode: string,
      phoneNumber: string,
      isActive: boolean,
      isEmailVerified: boolean,
      features: any[]
    ) => {
      dispatch(updateUserStart());
      try {
        const response = await api.put(`${API_ROUTES.GET_ALL_USERS}/${id}`, {
          firstName,
          lastName,
          email,
          organizationName,
          countryCode,
          phoneNumber,
          isActive: String(isActive),         
          isEmailVerified: String(isEmailVerified), 
          features, // ✅ Changed from roleIds to features
        });

        dispatch(updateUserSuccess(response.data));
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || 'Update failed';
        dispatch(updateUserFailure(errorMessage));
        throw err; // ✅ Re-throw error for form handling
      }
    },
    [dispatch]
  );

  const fetchUserById = useCallback(async (_id: string) => {
    dispatch(fetchUserByIdStart());
  
    try {
      const response = await api.get(`${API_ROUTES.GET_ALL_USERS}/${_id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
     dispatch(fetchUserByIdSuccess(response.data.data));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to fetch user';
      dispatch(fetchUserByIdFailure(errorMessage));
    }
  }, [dispatch]);

  const fetchRoles = useCallback(async () => {
    dispatch(fetchRolesStart());
    try {
      const response = await api.get(`${API_ROUTES.GET_ALL_ROLES}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      dispatch(fetchRolesSuccess(response.data.data.data));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to fetch roles';
      dispatch(fetchRolesFailure(errorMessage));
    }
  }, [dispatch]);

  // ✅ Fetch features from enterprises/features endpoint
  const fetchFeatures = useCallback(async () => {
    dispatch(fetchFeaturesStart());
    try {
      const response = await api.get('admin/enterprises/features', {
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
      throw err; // Re-throw for component handling
    }
  }, [dispatch]);

  const resetUserPassword = useCallback(async (email: string) => {
    try {
      const payload: any = {
        email,
      };
      const response = await api.post(`${API_ROUTES.GET_ALL_USERS}/resend-reset-link`, payload, {
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

  const updateUserStatus = useCallback(async (userId: string, isActive: boolean) => {
    try {
      const response = await api.patch(`${API_ROUTES.GET_ALL_USERS}/${userId}/status`, {
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
        'Failed to update user status';
      throw new Error(errorMessage);
    }
  }, []);

  const blockUser = useCallback(async (userId: string, blockValue: any) => {
    try {
      const response = await api.patch(`${API_ROUTES.GET_ALL_USERS}/${userId}/block`, blockValue, {
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
        'Failed to block user';
      throw new Error(errorMessage);
    }
  }, []);
 
  return { getUserList, addUser, removeUser, updateUser, fetchUserById, fetchRoles, fetchFeatures, resetUserPassword, updateUserStatus, blockUser };
}
