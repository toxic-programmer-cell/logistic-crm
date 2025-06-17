import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';

// Re-using a similar DetailItem component for displaying information
const DetailItem = ({ label, value }) => (
  <div className="mb-2">
    <span className="font-semibold text-gray-700 dark:text-gray-300">{label}: </span>
    <span className="text-gray-600 dark:text-gray-400">{value || 'N/A'}</span>
  </div>
);

const UpdateDocketPage = () => {
  const { docketId } = useParams();
  const navigate = useNavigate();
  const [docket, setDocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocketDetails = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/dockets/${docketId}`);
        if (response.data && response.data.success) {
          setDocket(response.data.data);
        } else {
          throw new Error(response.data.message || 'Failed to fetch docket details');
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching docket details for update:', err);
        setError(err.response?.data?.message || err.message || 'An unknown error occurred');
        toast.error(err.response?.data?.message || err.message || 'Could not fetch docket details.');
      } finally {
        setLoading(false);
      }
    };

    if (docketId) {
      fetchDocketDetails();
    }
  }, [docketId]);

  if (loading) {
    return <div className="p-6 text-center">Loading docket data for update...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500 text-center">Error: {error}</div>;
  }

  if (!docket) {
    return <div className="p-6 text-center">No docket data found to update.</div>;
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
          <ArrowLeftIcon size={20} className="mr-2" /> Back to Details
        </button>
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white border-b pb-3">Update Docket: {docket.docketNumber}</h1>

        {/* Displaying Docket Details */}
        <div className="mb-8 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
          <h2 className="text-xl font-semibold mb-4 text-indigo-600 dark:text-indigo-400">Current Docket Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
            <div>
              <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">Docket Info</h3>
              <DetailItem label="Docket Number" value={docket.docketNumber} />
              <DetailItem label="Origin" value={docket.origin} />
              <DetailItem label="Destination" value={docket.destination} />
              <DetailItem label="Status" value={docket.docketStatus} />
              <DetailItem label="Date" value={new Date(docket.date).toLocaleDateString()} />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">Client Details</h3>
              <DetailItem label="Client Name" value={docket.clientDetails?.fullName} />
              <DetailItem label="Client Email" value={docket.clientDetails?.email} />
              <DetailItem label="Client Phone" value={docket.clientDetails?.phoneNumber} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
