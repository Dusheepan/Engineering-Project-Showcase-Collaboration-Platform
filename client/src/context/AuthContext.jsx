import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

/**
 * Checks whether a given JWT token string has expired based on its payload 'exp' claim.
 */
const isTokenExpired = (jwtToken) => {
  if (!jwtToken) return true;
  try {
    const parts = jwtToken.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    // Buffer by 5 seconds to prevent race condition right on the boundary
    return payload.exp * 1000 <= Date.now() + 5000;
  } catch {
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) return null;
    if (isTokenExpired(savedToken)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
    return savedToken;
  });

  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken || isTokenExpired(savedToken)) {
      return null;
    }
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  /**
   * Listen for system-wide auth expiration events dispatched by Axios interceptors
   */
  useEffect(() => {
    const handleSessionExpired = (event) => {
      setToken(null);
      setUser(null);
      setAuthError(event.detail?.message || 'Your session has expired. Please log in again.');
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, []);

  /**
   * Verify token on initial app load and retrieve fresh user profile
   */
  const loadUser = useCallback(async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      setLoading(false);
      return;
    }

    if (isTokenExpired(savedToken)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await authService.getMe();
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (err) {
      console.warn('Session expired or invalid token:', err.message);
      // Clean up invalid session
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  /**
   * Log in user
   */
  const login = async (email, password) => {
    setAuthError(null);
    try {
      const data = await authService.login(email, password);
      const authToken = data.token;
      const authUser = data.user;

      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(authUser));

      setToken(authToken);
      setUser(authUser);
      return data;
    } catch (err) {
      setAuthError(err.message || 'Login failed');
      throw err;
    }
  };

  /**
   * Register new user
   */
  const register = async (userData) => {
    setAuthError(null);
    try {
      const data = await authService.register(userData);
      const authToken = data.token;
      const authUser = data.user;

      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(authUser));

      setToken(authToken);
      setUser(authUser);
      return data;
    } catch (err) {
      setAuthError(err.message || 'Registration failed');
      throw err;
    }
  };

  /**
   * Log out user
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setAuthError(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.role === 'admin',
    loading,
    authError,
    login,
    register,
    logout,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use AuthContext
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
