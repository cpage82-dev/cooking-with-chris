/**
 * Authentication Context
 * Manages user authentication state across the app
 */
import { createContext, useContext, useEffect, useState } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ write-through setter: updates React state + localStorage
  const setUser = (nextUser) => {
    setUserState(nextUser);
    if (nextUser) authService.setCurrentUser(nextUser);
    else authService.clearCurrentUser();
  };

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) setUserState(currentUser);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const loggedInUser = await authService.login(email, password);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (userData) => {
    return authService.register(userData);
  };

  const logout = async () => {
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
