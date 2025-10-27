import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import api from '../../../axios';
import {
  fetchRolesStart,
  fetchRolesSuccess,
  fetchRolesFailure,
  addRoleStart,
  addRoleSuccess,
  addRoleFailure,
  removeRoleStart,
  removeRoleSuccess,
  removeRoleFailure,
  updateRoleStart,
  updateRoleSuccess,
  updateRoleFailure,
  fetchRoleByIdStart,
  fetchRoleByIdSuccess,
  fetchRoleByIdFailure,
  fetchFeaturesStart,
  fetchFeaturesSuccess,
  fetchFeaturesFailure,
} from '../slices/roleSlice';
import type { FeaturePermission } from '../../../types/User';

export function useRoleActions() {
  const dispatch = useDispatch();

  const getRoleList = useCallback(
    async (page = 1, limit = 10, searchQuery = '') => {
      dispatch(fetchRolesStart());
      try {
        const response = await api.get('admin/roles', {
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
  
        dispatch(fetchRolesSuccess({ roles: data, pagination }));
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || 
          err.response?.data?.error ||
          err.message || 
          'Failed to fetch roles';
        dispatch(fetchRolesFailure(errorMessage));
      }
    },
    [dispatch]
  );
  

  const removeRole = useCallback(async (id: string) => {
    dispatch(removeRoleStart());
    try {
      await api.delete(`admin/roles/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      dispatch(removeRoleSuccess(id));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 
        err.response?.data?.error ||
        err.message || 
        'Failed to remove role';
      dispatch(removeRoleFailure(errorMessage));
      throw err;
    }
  }, [dispatch]);

  const addRole = useCallback(async (
    name: string,
    featurePermissions: FeaturePermission[]
  ) => {
    dispatch(addRoleStart());
    try {
      const response = await api.post(
        'admin/roles',
        { name, featurePermissions },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const roleData = response.data.data || response.data;
      dispatch(addRoleSuccess(roleData));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 
        err.response?.data?.error ||
        err.message || 
        'Failed to add role';
      dispatch(addRoleFailure(errorMessage));
      throw err;
    }
  }, [dispatch]);
  
  const updateRole = useCallback(async (
    id: string,
    name: string,
    featurePermissions: FeaturePermission[]
  ) => {
    dispatch(updateRoleStart());
    try {
      const response = await api.put(
        `admin/roles/${id}`,
        { name, featurePermissions },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      // Handle different API response structures
      let roleData;
      if (response.data.data) {
        roleData = response.data.data;
      } else if (response.data.role) {
        roleData = response.data.role;
      } else if (response.data.id) {
        // Direct role object
        roleData = response.data;
      } else {
        roleData = response.data;
      }
      
      // Ensure we have the required fields
      const processedRoleData = {
        id: roleData.id || id, // Use original ID as fallback
        name: roleData.name || name, // Use submitted name as fallback
        featurePermissions: roleData.featurePermissions || featurePermissions,
        ...roleData // Include any other fields from API
      };
      
      dispatch(updateRoleSuccess(processedRoleData));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 
        err.response?.data?.error ||
        err.message || 
        'Failed to update role';
      dispatch(updateRoleFailure(errorMessage));
      throw err;
    }
  }, [dispatch]);
  

  const fetchRoleById = useCallback(async (_id: string) => {
    dispatch(fetchRoleByIdStart());
    try {
      const response = await api.get(`admin/roles/${_id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      dispatch(fetchRoleByIdSuccess(response.data.data));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to fetch role';
      dispatch(fetchRoleByIdFailure(errorMessage));
    }
  }, [dispatch]);

  const fetchFeatures = useCallback(async () => {
    dispatch(fetchFeaturesStart());
    try {
      const response = await api.get('admin/features', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      dispatch(fetchFeaturesSuccess(response.data.data.data));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to fetch features';
      dispatch(fetchFeaturesFailure(errorMessage));
    }
  }, [dispatch]);

  return {
    getRoleList,
    addRole,
    removeRole,
    updateRole,
    fetchRoleById,
    fetchFeatures,
  };
}
