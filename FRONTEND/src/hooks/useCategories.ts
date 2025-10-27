import { useState, useEffect } from 'react';
import api from '../axios';
import { API_ROUTES } from '../constants/routes';

interface UseCategoriesReturn {
  categories: string[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`${API_ROUTES.CONTENT_POLICIES}/categories`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      setCategories(response.data.categories || []);
    } catch (err: any) {
      
      // Fallback to empty array if API fails
      setCategories([]);
      setError(null); // Don't show error for fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
};
