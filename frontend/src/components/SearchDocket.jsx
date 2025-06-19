import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon } from 'lucide-react';
import { useDockets } from '../context/DocketContext';

const SearchDocket = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
   const { searchSingleDocket, clearSearch, activeSearchSingleResult, isSearching, error: contextError } = useDockets();

   // Effect to handle clearing context search when navigating back and search input is empty
  useEffect(() => {
    if (searchTerm.trim() === '' && activeSearchSingleResult) {
      clearSearch();
    }
    // Dependencies: local searchTerm, context's activeSearchSingleResult, and context's clearSearch function.
  }, [searchTerm, activeSearchSingleResult, clearSearch]);


   const handleInputChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    if (newSearchTerm.trim() === '') {
      clearSearch(); // Clear the search result in context
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault();
    await searchSingleDocket(searchTerm);
  };

  const handleViewDocket = (docketId) => {
    navigate(`/dashboard/docket/${docketId}`);
  };

  const displaySearchResult = activeSearchSingleResult && searchTerm.trim() !== '';

  const displaySearchError = contextError && !activeSearchSingleResult && searchTerm.trim() !== '';

  return (
    <div className="mb-6 p-4 bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <form onSubmit={handleSearch} className="flex items-center space-x-2">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="Enter Docket No, Email, Phone, or Vendor"
          className="flex-grow p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center"
        >
          <SearchIcon size={18} className="mr-2" />
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {displaySearchResult && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-md">
          <h3 className="font-semibold text-green-700 dark:text-green-300">Docket Found: {activeSearchSingleResult.docketNumber}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Client: {activeSearchSingleResult.clientDetails?.fullName || 'N/A'}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Origin: {activeSearchSingleResult.origin} - Destination: {activeSearchSingleResult.destination}</p>
          <button
            onClick={() => handleViewDocket(activeSearchSingleResult._id)}
            className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View Details
          </button>
        </div>
      )}

      {displaySearchError && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md">
          <p className="text-red-700 dark:text-red-300">{contextError}</p>
        </div>
      )}
    </div>
  );
};

export default SearchDocket;
