import { useCallback } from 'react';
import api from '../../../axios';
import { API_ROUTES } from '../../../constants/routes';
import type { Form } from '../../../types/form';

export function useFormsActions() {
  const getFormsList = useCallback(async (): Promise<Form[]> => {
    try {
      const response = await api.get(API_ROUTES.GET_ALL_FORM_BUILDER_LIST, {
        params: {
            type: 'venue-category', 
          },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      // Return the forms data
      return response.data?.data || [];
    } catch (err: any) {
      // Failed to fetch forms
      return [];
    }
  }, []); // No dependencies needed

  return {
    getFormsList,
  };
}
