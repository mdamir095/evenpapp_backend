import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import api from '../../../axios';
import { fetchUsersStart, fetchUsersSuccess, fetchUsersFailure, removeUserStart, removeUserSuccess, removeUserFailure } from '../slices/userSlice';
import { API_ROUTES } from '../../../constants/routes';

export function useDynamicFormActions() {
  const dispatch = useDispatch();

  const getFormList = useCallback(
    async (page = 1, limit = 10, searchQuery = '', roleName = '') => {
      dispatch(fetchUsersStart());
      try {
        const response = await api.get(API_ROUTES.GET_ALL_FORM_BUILDER_LIST, {
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


  const removeForm = useCallback(async (_id: string) => {
    dispatch(removeUserStart());
    try {
      const response = await api.delete(`${API_ROUTES.DELETE_FORM}/${_id}`, {
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


  return { getFormList, removeForm };
}
