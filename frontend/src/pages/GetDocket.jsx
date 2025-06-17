import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';

const GetDocket = () => {
  const [dockets, setDockets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchDockets = async () => {
      try {
        setLoading(true);
        // The route GET /api/v1/dockets/ is handled by getAllDockets in the backend
        const response = await axiosInstance.get('/dockets/');
        if (response.data && response.data.success) {
          setDockets(response.data.data);
        } else {
          throw new Error(response.data.message || 'Failed to fetch dockets');
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching dockets:', err);
        setError(err.response?.data?.message || err.message || 'An unknown error occurred');
        toast.error(err.response?.data?.message || err.message || 'Could not fetch dockets.');
      } finally {
        setLoading(false);
      }
    };

    fetchDockets();
  }, []);

  const handleRowClick = (docketId) => {
    navigate(`/dashboard/docket/${docketId}`)
  }


  if (loading) {
    return <div className="p-6">Loading dockets... </div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">All Dockets</h1>
      {dockets.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No dockets found.</p>
      ) : (
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
              {dockets.map((docket, index) => (
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
