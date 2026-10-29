import axios from 'axios';

/**
 * Axios instance configured for the Engineering Showcase API
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor for unified error formatting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message:
        error.response?.data?.message ||
        error.message ||
        'An unexpected error occurred',
      errors: error.response?.data?.errors || [],
      status: error.response?.status,
    };
    return Promise.reject(customError);
  }
);

export default api;
