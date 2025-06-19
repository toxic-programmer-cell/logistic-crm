import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';

const DocketContext = createContext();

export const useDockets = () => {
  return useContext(DocketContext);
};

export const DocketProvider = ({ children }) => {
  const [allDockets, setAllDockets] = useState([]);
  const [activeSearchSingleResult, setActiveSearchSingleResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

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
    fetchAllDockets();
  }, [fetchAllDockets]);

  const searchSingleDocket = useCallback(async (searchTerm) => {
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
  }, [allDockets, isLoading, fetchAllDockets]);

  const clearSearch = useCallback(() => {
    setActiveSearchSingleResult(null);
    setError(null);
    // if (allDockets.length === 0 && !isLoading) fetchAllDockets();
    if (allDockets.length === 0 && !isLoading) {
      fetchAllDockets();
    }
  }, [allDockets, isLoading, fetchAllDockets]);

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
