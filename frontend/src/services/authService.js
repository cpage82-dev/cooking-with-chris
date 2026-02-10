/**
 * Authentication service
 */
import api from './api';

const authService = {
  /**
   * Login user
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login/', {
      email: email.toLowerCase().trim(),
      password,
    });
    
    const { access, refresh, user } = response.data;
    
    // Store tokens and user data
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  },

  /**
   * Register new user
   */
  register: async (userData) => {
    const response = await api.post('/users/', {
      email: userData.email.toLowerCase().trim(),
      password: userData.password,
      first_name: userData.firstName,
      last_name: userData.lastName,
    });
    
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    
    try {
      if (refreshToken) {
        await api.post('/auth/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call result
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        return null;
      }
    }
    return null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email) => {
    const response = await api.post('/auth/password-reset/', {
      email: email.toLowerCase().trim(),
    });
    return response.data;
  },

  /**
   * Confirm password reset
   */
  confirmPasswordReset: async (token, newPassword, confirmPassword) => {
    const response = await api.post('/auth/password-reset-confirm/', {
      token,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });
    return response.data;
  },
};

export default authService;
