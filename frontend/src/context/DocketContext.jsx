import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext'; // Assuming you have an AuthContext for authentication

const DocketContext = createContext();
 // Get authentication status from AuthContext

export const useDockets = () => {
  
  const context = useContext(DocketContext);
    if (context === undefined) {
        throw new Error('useDockets must be used within a DocketProvider');
    }
    return context;
};

export const DocketProvider = ({ children }) => {
  const [allDockets, setAllDockets] = useState([]);
  const [activeSearchSingleResult, setActiveSearchSingleResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const { isAuthenticated } = useAuth(); // Get authentication status from AuthContext

  const fetchAllDockets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/dockets/');
      if (response.data && response.data.success) {
        setAllDockets(response.data.data);
        setActiveSearchSingleResult(null); // Clear any previous search result
      } else {
        throw new Error(response.data.message || 'Failed to fetch dockets');
      }
    } catch (err) {
      console.error('Error fetching all dockets:', err);
      const errMsg = err.response?.data?.message || err.message || 'An unknown error occurred';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllDockets();
    } else {
      setAllDockets([]);
      setActiveSearchSingleResult(null);
      setIsLoading(false); // Ensure loading state is false when not authenticated
      setError(null);
    } 
  }, [fetchAllDockets, isAuthenticated]);

  const searchSingleDocket = useCallback(async (searchTerm) => {
    if (!isAuthenticated) {
        toast.warn('Please log in to search dockets.');
        return null;
    }

    if (!searchTerm.trim()) {
      toast.info('Please enter a search term.');
      setActiveSearchSingleResult(null); // Clear search if term is empty
      if (allDockets.length === 0 && !isLoading) {
        fetchAllDockets();
      }
      return null; // Indicate no search was performed
    }

    setIsSearching(true);
    setError(null); // Clear previous errors
    setActiveSearchSingleResult(null); // Clear previous search result

    try {
      const response = await axiosInstance.get(`/dockets/lookup/${searchTerm.trim()}`);
      if (response.data && response.data.success && response.data.data) {
        setActiveSearchSingleResult(response.data.data);
        // toast.success('Docket found!');
        // return response.data.data;
      } else {
        const message = response.data.message || 'Docket not found.';
        setError(message); // Set error for display in GetDocket if needed
        // toast.warn(message);
      }
    } catch (err) {
      console.error('Error searching docket:', err);
      const errMsg = err.response?.data?.message || err.message || 'An unknown error occurred during search.';
      setError(errMsg); // Set error for display
      toast.error(errMsg);
      return null;
    } finally {
      setIsSearching(false);
    }
  }, [isAuthenticated, allDockets, fetchAllDockets]);

  const clearSearch = useCallback(() => {
    setActiveSearchSingleResult(null);
    setError(null);
    // if (allDockets.length === 0 && !isLoading) fetchAllDockets();
    if (isAuthenticated && allDockets.length === 0 && !isLoading) {
      fetchAllDockets();
    }
  }, [allDockets, isLoading, fetchAllDockets, isAuthenticated]);

  const docketsToDisplay = activeSearchSingleResult ? [activeSearchSingleResult] : allDockets;
  const tableTitle = activeSearchSingleResult ? "Search Result" : "All Dockets";

  const value = {
    allDockets,
    activeSearchSingleResult,
    docketsToDisplay,
    tableTitle,
    isLoading, // Overall loading for the initial list
    isSearching, // Specific loading for search action
    error,
    fetchAllDockets,
    searchSingleDocket,
    clearSearch,
  };

  return <DocketContext.Provider value={value}>{children}</DocketContext.Provider>;
};
