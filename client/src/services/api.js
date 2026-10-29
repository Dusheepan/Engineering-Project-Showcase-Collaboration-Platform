import axios from 'axios';

/**
 * Centralized Axios instance configured for the Engineering Showcase API
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * Request Interceptor
 * Automatically attaches the JWT token from localStorage to every outgoing request
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 * Normalizes error responses from the backend
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server returns { success: false, errors: [...] } or { message: ... }
    const responseData = error.response?.data;
    const errorsList = responseData?.errors || [];

    const firstErrorMessage =
      errorsList[0]?.message ||
      responseData?.message ||
      error.message ||
      'An unexpected error occurred';

    const customError = {
      message: firstErrorMessage,
      errors: errorsList,
      status: error.response?.status,
      data: responseData,
    };

    return Promise.reject(customError);
  }
);

export default api;
