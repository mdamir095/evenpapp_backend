import api, { handleApiError } from './index';

/**
 * Global API Helpers for GET, POST, PUT, DELETE requests
 * All errors are handled globally via handleApiError
 */

export async function fetcher<T>(url: string, config = {}): Promise<T> {
  try {
    const response = await api.get<T>(url, config);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function poster<T, D = unknown>(url: string, data: D, config = {}): Promise<T> {
  try {
    const response = await api.post<T>(url, data, config);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function putter<T, D = unknown>(url: string, data: D, config = {}): Promise<T> {
  try {
    const response = await api.put<T>(url, data, config);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function deleter<T = unknown>(url: string, config = {}): Promise<T> {
  try {
    const response = await api.delete<T>(url, config);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

