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

    // Auto-logout when token has expired or is invalid (401 Unauthorized)
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isAuthAttempt =
        requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

      // Do not auto-logout if the 401 was from an intentional login attempt with bad credentials
      if (!isAuthAttempt) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        if (typeof window !== 'undefined') {
          // Notify in-memory AuthContext listeners
          window.dispatchEvent(
            new CustomEvent('auth:session-expired', {
              detail: {
                message: firstErrorMessage || 'Your session has expired. Please log in again.',
              },
            })
          );

          // Redirect to login if user was on a protected or active page
          const pathname = window.location.pathname;
          if (!pathname.startsWith('/login') && !pathname.startsWith('/register')) {
            window.location.href = '/login?expired=true';
          }
        }
      }
    }

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
