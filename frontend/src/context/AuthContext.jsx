/**
 * Authentication Context
 * Manages user authentication state across the app
 */
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

// Inactivity timeout: 12 hours in milliseconds
const INACTIVITY_TIMEOUT = 12 * 60 * 60 * 1000; // 12 hours

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimerRef = useRef(null);

  // ✅ write-through setter: updates React state + localStorage
  const setUser = (nextUser) => {
    setUserState(nextUser);
    if (nextUser) {
      authService.setCurrentUser(nextUser);
      resetInactivityTimer(); // Start inactivity timer
    } else {
      authService.clearCurrentUser();
      clearInactivityTimer(); // Clear timer on logout
    }
  };

  // Clear inactivity timer
  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  // Auto-logout after inactivity
  const handleInactivityLogout = useCallback(async () => {
    console.log('Auto-logout due to inactivity');
    await authService.logout();
    setUserState(null);
    window.location.href = '/login?reason=inactivity';
  }, []);

  // Reset inactivity timer on user activity
  const resetInactivityTimer = useCallback(() => {
    clearInactivityTimer();
    
    // Only set timer if user is logged in
    if (authService.getCurrentUser()) {
      inactivityTimerRef.current = setTimeout(() => {
        handleInactivityLogout();
      }, INACTIVITY_TIMEOUT);
    }
  }, [clearInactivityTimer, handleInactivityLogout]);

  // Track user activity (mouse, keyboard, touch)
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUserState(currentUser);
      resetInactivityTimer(); // Start timer on mount
    }
    setLoading(false);

    // Activity event listeners
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      if (authService.getCurrentUser()) {
        resetInactivityTimer();
      }
    };

    // Add listeners for all activity events
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Cleanup
    return () => {
      clearInactivityTimer();
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [resetInactivityTimer, clearInactivityTimer]);

  const login = async (email, password) => {
    const loggedInUser = await authService.login(email, password);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (userData) => {
    return authService.register(userData);
  };

  const logout = async () => {
    clearInactivityTimer();
    await authService.logout();
    setUser(null);
  };

  const value = {
    user,
    setUser,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export default AuthContext;