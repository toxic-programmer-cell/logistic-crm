import React from 'react';
import { useNavigate } from 'react-router-dom';
import SearchDocket from '../components/SearchDocket';
import { useDockets } from '../context/DocketContext';

const GetDocket = () => {
  const navigate = useNavigate();

  const {
    docketsToDisplay,
    tableTitle,
    isLoading, // This is for the initial load of all dockets
    error,     // This is for errors from fetching all dockets or searching
    activeSearchSingleResult // To know if a search is active
  } = useDockets();

  const handleRowClick = (docketId) => {
    navigate(`/dashboard/docket/${docketId}`)
  }


  if (isLoading && docketsToDisplay.length === 0 && !activeSearchSingleResult) {
    return <div className="p-6 text-center">Loading dockets...</div>;
  }

  if (error && docketsToDisplay.length === 0 && !activeSearchSingleResult) {
    return <div className="p-6 text-red-500 text-center">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <SearchDocket />
      <h1 className="text-2xl font-semibold my-4 text-gray-800 dark:text-white">{tableTitle}</h1>
      
      {docketsToDisplay.length === 0 && !isLoading && (
        <p className="text-gray-600 dark:text-gray-400 text-center">
          {activeSearchSingleResult === null && !error ? "No dockets found." : ""}
        </p>
      )}

      {docketsToDisplay.length > 0 && (
        <div className="overflow-x-auto shadow-md sm:rounded-lg">
          <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Serial No.</th>
                <th scope="col" className="px-6 py-3">Docket Number</th>
                <th scope="col" className="px-6 py-3">Client Name</th>
                <th scope="col" className="px-6 py-3">Origin</th>
                <th scope="col" className="px-6 py-3">Destination</th>
                <th scope="col" className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {docketsToDisplay.map((docket, index) => (
                <tr
                  key={docket._id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                  onClick={() => handleRowClick(docket._id)}
                >
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{docket.docketNumber}</td>
                  <td className="px-6 py-4">{docket.clientDetails?.fullName || 'N/A'}</td>
                  <td className="px-6 py-4">{docket.origin}</td>
                  <td className="px-6 py-4">{docket.destination}</td>
                  <td className="px-6 py-4">{docket.docketStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GetDocket;
