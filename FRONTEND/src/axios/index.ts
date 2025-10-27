import axios from 'axios';

// --- Enterprise Axios Instance Setup ---
import { API_BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Global Error Handler Utility ---
export function handleApiError(error: unknown) {
  // Example: Show a toast notification (replace with your notification system)
  // toast.error(error?.response?.data?.message || 'API Error');
  // Add more global error handling logic here if needed
}

// --- Request Interceptor: Attach Auth Token ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    handleApiError(error);
    return Promise.reject(error);
  }
);

// --- Response Interceptor: Global Error Handling ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors, e.g., token expiration
    if (error.response && error.response.status === 401) {
      console.error('401 Unauthorized - Token may be expired or invalid');
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optionally redirect to login
      // window.location.href = '/login';
    }
    handleApiError(error);
    return Promise.reject(error);
  }
);

export default api;
