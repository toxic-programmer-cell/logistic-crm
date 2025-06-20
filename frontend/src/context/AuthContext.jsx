import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // Handles initial auth check

  const checkAuthStatus = useCallback(async () => {
    setIsLoadingAuth(true);
    try {
      const response = await axiosInstance.get('/users/me');
      if (response.data && response.data.success) {
        setCurrentUser(response.data.data.user);
        setIsAuthenticated(true);
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      // Handled by axiosInstance interceptor if it's a 401 leading to logout
      // Otherwise, assume not authenticated
      console.info('Auth check failed or no active session:', error.message);
      setCurrentUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (email, password) => {

    try {
      const response = await axiosInstance.post('/users/login', { email, password });
      // console.log("Login API Response:", response);
      // console.log("here")
      if (response.data && response.data.success) {
        setCurrentUser(response.data.data.user);
        setIsAuthenticated(true);
        toast.success('User logged in successfully.');
        // Navigation to home will occur due to AppRoutes re-rendering based on isAuthenticated
        return true;
      } else if (response.data && !response.data.success) {
        throw new Error(response.data.message || 'Login failed with an unspecified error.');
      }else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'An unknown error occurred during login.';
      toast.error(errMsg);
      setCurrentUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/users/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
      toast.error('Logout failed on server, clearing session locally.');
    } finally {
      setCurrentUser(null);
      setIsAuthenticated(false);
      // AppRoutes will handle redirecting to Login page
    }
  };

  if (isLoadingAuth) {
    // You can return a loading spinner or null here
    // For simplicity, returning null, but a global loader is better UX
    return null; 
  }

  return (
    <AuthContext.Provider value={{ 
        currentUser, 
        isAuthenticated, 
        isLoadingAuth, 
        login, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};













































// import React, { createContext, useContext, useState } from 'react';
// import axiosInstance from '../api/axiosInstance';

// const AuthContext = createContext(null);

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//     const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('accessToken'));

//   const login = () => {
//     // Assuming accessToken is set in localStorage by the Login component upon successful API call
//     setIsAuthenticated(true);
//   };

//   const logout = async () => {
//     try {
//       // Optional: Call API to invalidate session on backend
//       await axiosInstance.get('/users/logout')
//       console.log("User logged out successfully.");
//     } catch (error) {
//       console.error("Logout API call failed:", error);
//     } finally {
//       localStorage.removeItem('accessToken');
//       setIsAuthenticated(false);
//     }
//   };

//   const value = {
//     isAuthenticated,
//     login,
//     logout,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export default AuthProvider;

