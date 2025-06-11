import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('accessToken'));

  const login = () => {
    // Assuming accessToken is set in localStorage by the Login component upon successful API call
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      // Optional: Call API to invalidate session on backend
      await axios.get('/api/v1/users/logout')
    } catch (error) {
      console.error("Logout API call failed:", error);
    }
    localStorage.removeItem('accessToken');
    setIsAuthenticated(false);
    // No need to navigate here, App.jsx routing will handle it
  };

  const value = {
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;

