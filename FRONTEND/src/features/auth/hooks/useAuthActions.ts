import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import api from '../../../axios';
import { loginStart, loginSuccess, loginFailure, logout, fetchProfileStart, fetchProfileSuccess, fetchProfileFailure, changePasswordStart, changePasswordSuccess, changePasswordFailure, fileUploadStart, fileUploadSuccess, fileUploadFailure } from '../slices/authSlice';
import type { UpdateProfileSchemaType } from '../schemas/login.schema';
import { API_ROUTES } from '../../../constants/routes';

export function useAuthActions() {
  const dispatch = useDispatch();

  const login = useCallback(async (email: string, password: string) => {
    dispatch(loginStart());
    try {
      // Make a POST request to your authentication endpoint using axios
      const response = await api.post('admin/login', {
        email,
        password,
        // Add any additional fields your API expects here
      }, {
        headers: {
          'Content-Type': 'application/json',
          // Add any additional headers if required, e.g., Authorization, etc.
        }
      });

      // Assume the API returns a token or user info in response.data
      const token = response.data.data.accessToken; // Adjust according to your API response
      localStorage.setItem('token', response.data.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.data));
      // Dispatch success action with the token (or user info)
      dispatch(loginSuccess(token));
    } catch (err: any) {
      // Handle errors (network issues, invalid credentials, etc.)
      // Axios error messages can be in err.response?.data?.message
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Invalid credentials';
      dispatch(loginFailure(errorMessage));
    }
  }, [dispatch]);

  const signOut = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const sendResetLink = useCallback(async (email: string) => {
    dispatch(loginStart());
    try {
      const response = await api.post('admin/forgot-password', {
        email,
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      dispatch(loginSuccess(response.data.data.accessToken));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Invalid credentials';
      dispatch(loginFailure(errorMessage));
    }
  }, [dispatch]);

  const resetPassword = useCallback(async (newPassword: string, token: string) => {
    dispatch(loginStart());
    try {
      const response = await api.post('admin/reset-password', {
        newPassword,
        token,
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      dispatch(loginSuccess(response.data.data.accessToken));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Invalid credentials';
      dispatch(loginFailure(errorMessage));
    }
  }, [dispatch]);

  const updateProfile = useCallback(async (data: UpdateProfileSchemaType, _id: string) => {
    dispatch(loginStart());
    try {
      const response = await api.put(`${API_ROUTES.UPDATE_PROFILE}`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      
      // Update localStorage with new profile data
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...currentUser,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        countryCode: data.countryCode,
        phoneNumber: data.phoneNumber,
        organizationName: data.organizationName,
        profileImage: data.profileImage,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Trigger custom event to notify useUser hook
      window.dispatchEvent(new Event('userUpdated'));
      
      dispatch(loginSuccess(response.data.data.accessToken));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Invalid credentials';
      dispatch(loginFailure(errorMessage));
    }
  }, [dispatch]);

  const fetchProfile = useCallback(async (_id: string) => {
    dispatch(fetchProfileStart());
  
    try {
      const response = await api.get(`${API_ROUTES.GET_PROFILE}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
     dispatch(fetchProfileSuccess(response.data.data));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to fetch user';
      dispatch(fetchProfileFailure(errorMessage));
    }
  }, [dispatch]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    dispatch(changePasswordStart());
    try {
      const response = await api.put(`${API_ROUTES.CHANGE_PASSWORD}`, {
        currentPassword,
        newPassword,
        confirmPassword,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      
      dispatch(changePasswordSuccess(response.data.data.accessToken));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Invalid credentials';
      dispatch(changePasswordFailure(errorMessage));
    }
  }, [dispatch]);

  const updateProfileImage = useCallback(async (file: File): Promise<string> => {
    dispatch(fileUploadStart());
  
    try {
      const formData = new FormData();
      formData.append('file', file);
  
      // Log contents of FormData
      for (const [key, value] of formData.entries()) {
        // FormData logging removed
      }
      const response = await api.post(`${API_ROUTES.UPDATE_PROFILE_IMAGE}`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      const fileUrl = response.data.data;
      
      if (!fileUrl) throw new Error('File URL not returned');

      // Ensure fileUrl is a string
      const imageUrlString = typeof fileUrl === 'string' ? fileUrl : String(fileUrl);

      // Update localStorage with new profile image
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...currentUser,
        profileImage: imageUrlString,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Don't trigger userUpdated event to prevent profile refetch that causes form reset
      // window.dispatchEvent(new Event('userUpdated'));

      dispatch(fileUploadSuccess(imageUrlString));
      return imageUrlString;
  
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Image upload failed';
      dispatch(fileUploadFailure(errorMessage));
      throw new Error(errorMessage);
    }
  }, [dispatch]);
  
  

  return { login, signOut, resetPassword, sendResetLink, updateProfile, fetchProfile, changePassword, updateProfileImage };
}
