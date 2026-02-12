/**
 * Authentication service
 */
import api from "./api";

const USER_KEY = "user";
const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

const authService = {
  /**
   * Get current user from localStorage
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Persist current user to localStorage
   */
  setCurrentUser: (user) => {
    if (!user) return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /**
   * Clear persisted user
   */
  clearCurrentUser: () => {
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Login user
   */
  login: async (email, password) => {
    const response = await api.post("/auth/login/", {
      email: email.toLowerCase().trim(),
      password,
    });

    const { access, refresh, user } = response.data;

    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
    authService.setCurrentUser(user);

    return user;
  },

  /**
   * Register new user
   */
  register: async (userData) => {
    const response = await api.post("/users/", {
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
    const refreshToken = localStorage.getItem(REFRESH_KEY);

    try {
      if (refreshToken) {
        await api.post("/auth/logout/", { refresh: refreshToken });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
      authService.clearCurrentUser();
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem(ACCESS_KEY);
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email) => {
    const response = await api.post("/auth/password-reset/", {
      email: email.toLowerCase().trim(),
    });
    return response.data;
  },

  /**
   * Confirm password reset
   */
  confirmPasswordReset: async (token, newPassword, confirmPassword) => {
    const response = await api.post("/auth/password-reset-confirm/", {
      token,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });
    return response.data;
  },
};

export default authService;
