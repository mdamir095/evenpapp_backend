import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import api from '../../../axios';
import {
  fetchFeaturesStart,
  fetchFeaturesSuccess,
  fetchFeaturesFailure,
  addFeatureStart,
  addFeatureSuccess,
  addFeatureFailure,
  removeFeatureStart,  
  removeFeatureSuccess,
  removeFeatureFailure,
  updateFeatureStart,
  updateFeatureSuccess,
  updateFeatureFailure,
  fetchFeatureByIdStart,
  fetchFeatureByIdSuccess,
  fetchFeatureByIdFailure,
} from '../slices/featureSlice';
import { API_ROUTES } from '../../../constants/routes';

export function useFeatureActions() {
  const dispatch = useDispatch();

  const getFeatureList = useCallback(
    async (page = 1, limit = 10, searchQuery = '') => {
      dispatch(fetchFeaturesStart());
      try {
        const response = await api.get(API_ROUTES.GET_ALL_FEATURES, {
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
  
        dispatch(fetchFeaturesSuccess({ features: data, pagination }));
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || 
          err.response?.data?.error ||
          err.message || 
          'Failed to fetch features';
        dispatch(fetchFeaturesFailure(errorMessage));
      }
    },
    [dispatch]
  );
  

  const removeFeature = useCallback(async (id: string) => {
    dispatch(removeFeatureStart());
    try {
      await api.delete(`${API_ROUTES.GET_ALL_FEATURES}/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      dispatch(removeFeatureSuccess(id));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 
        err.response?.data?.error ||
        err.message || 
        'Failed to remove feature';
      dispatch(removeFeatureFailure(errorMessage));
      throw err;
    }
  }, [dispatch]);

  const addFeature = useCallback(async (
    name: string,
    isActive: boolean,
  ) => {
    dispatch(addFeatureStart());
    try {
      const response = await api.post(
        API_ROUTES.GET_ALL_FEATURES,
        { name, isActive },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const featureData = response.data?.data || response.data;
      dispatch(addFeatureSuccess(featureData));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 
        err.response?.data?.error ||
        err.message || 
        'Failed to add feature';
      dispatch(addFeatureFailure(errorMessage));
      throw err;
    }
  }, [dispatch]);
  
  const updateFeature = useCallback(async (
    id: string,
    name: string,
    isActive: boolean,
  ) => {
    dispatch(updateFeatureStart());
    try {
      const response = await api.put(
        `${API_ROUTES.GET_ALL_FEATURES}/${id}`,
        { name, isActive },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const featureData = response.data?.data || response.data;
      dispatch(updateFeatureSuccess(featureData));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 
        err.response?.data?.error ||
        err.message || 
        'Failed to update feature';
      dispatch(updateFeatureFailure(errorMessage));
      throw err;
    }
  }, [dispatch]);
  

  const fetchFeatureById = useCallback(async (_id: string) => {
    dispatch(fetchFeatureByIdStart());
    try {
      const response = await api.get(`${API_ROUTES.GET_ALL_FEATURES}/${_id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      dispatch(fetchFeatureByIdSuccess(response.data.data));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to fetch feature';
      dispatch(fetchFeatureByIdFailure(errorMessage));
    }
  }, [dispatch]);

  return {
    getFeatureList,
    addFeature,
    removeFeature,
    updateFeature,
    fetchFeatureById,
  };
}
