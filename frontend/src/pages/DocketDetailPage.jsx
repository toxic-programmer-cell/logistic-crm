import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, EditIcon, Trash2Icon, DownloadIcon } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';

// Re-using a similar DetailItem component for displaying information
const DetailItem = ({ label, value }) => (
  <div className="mb-2">
    <span className="font-semibold text-gray-700 dark:text-gray-300">{label}: </span>
    <span className="text-gray-600 dark:text-gray-400">{value || 'N/A'}</span>
  </div>
);

const DocketDetailPage = () => {
  const { docketId } = useParams();
  const navigate = useNavigate();
  const [docket, setDocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);


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
        console.error('Error fetching docket details:', err);
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

  const handleUpdate = () => {
    navigate(`/dashboard/docket/update/${docketId}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this docket? This action cannot be undone.')) {
      setIsDeleting(true);
      try {
        await axiosInstance.delete(`/dockets/${docketId}`);
        toast.success('Docket deleted successfully!');
        navigate('/dashboard/get-docket'); // Navigate to the list of dockets
      } catch (err) {
        console.error('Error deleting docket:', err);
        toast.error(err.response?.data?.message || err.message || 'Failed to delete docket.');
        setIsDeleting(false);
      }
    }
  };

  const handleDownloadPdf = async () => {
    const input = document.getElementById('docket-details-content'); // ID of the container to capture
    if (!input) {
      toast.error("Could not find the content to download.");
      return;
    }

    input.classList.add('pdf-export-styles'); // Add temporary class for PDF-specific styles
    toast.info("Generating PDF...");
    try {
      const canvas = await html2canvas(input, { scale: 2 }); // Increase scale for better resolution
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4'); // 'p' for portrait, 'mm' for units, 'a4' for page size
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`docket_${docket.docketNumber}.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF.");
    } finally {
      input.classList.remove('pdf-export-styles') // Remove temporary class
    }
  };


  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="p-6 text-center">Loading docket details...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500 text-center">Error: {error}</div>;
  }

  if (!docket) {
    return <div className="p-6 text-center">No docket data found.</div>;
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
            <ArrowLeftIcon size={20} className="mr-2" /> Back
          </button>
          <div className="flex space-x-3">
            <button
              onClick={handleUpdate}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <EditIcon size={16} className="mr-2" /> Update
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600 disabled:opacity-50"
            >
              <Trash2Icon size={16} className="mr-2" /> {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
            <button
              onClick={handleDownloadPdf}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600">
              <DownloadIcon size={16} className="mr-2" /> Download PDF
            </button>
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white border-b pb-3">Docket Number: {docket.docketNumber}</h1>


        {/* Displaying Docket Details */}
        <div id="docket-details-content">
          <div className="mb-8 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-indigo-600 dark:text-indigo-400">Docket Info</h3>
                {/* <DetailItem label="Docket Number" value={docket.docketNumber} /> */}
                <DetailItem label="Origin" value={docket.origin} />
                <DetailItem label="Destination" value={docket.destination} />
                <DetailItem label="Status" value={docket.docketStatus} />
                <DetailItem label="Date" value={formatDate(docket.date)} />
                <DetailItem label="Payment Type" value={docket.payType} />
                <DetailItem label="Mode" value={docket.mode} />
                <DetailItem label="Package Type" value={docket.packType} />
                <DetailItem label="Item Description" value={docket.item} />
                <DetailItem label="Created By" value={docket.createdBy?.username || 'N/A'} />
                <DetailItem label="Created At" value={formatDate(docket.createdAt)} />
                <DetailItem label="Last Updated At" value={formatDate(docket.updatedAt)} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-indigo-600 dark:text-indigo-400">Client Details</h3>
                <DetailItem label="Client Name" value={docket.clientDetails?.fullName} />
                <DetailItem label="Client Email" value={docket.clientDetails?.email} />
                <DetailItem label="Client Phone" value={docket.clientDetails?.phoneNumber} />
                <DetailItem label="Client Address" value={docket.clientDetails?.address} />
                <DetailItem label="Client GST" value={docket.clientDetails?.gstNumber} />
                <DetailItem label="Consignor" value={docket.clientDetails?.consignor} />

                {docket.clientDetails?.reciverClient && (
                  <>
                    <h3 className="text-lg font-medium mt-4 mb-2 text-gray-700 dark:text-gray-300 underline">Receiver Client Details :</h3>
                    <DetailItem label="Receiver Name" value={docket.clientDetails.reciverClient.fullName} />
                    <DetailItem label="Receiver Email" value={docket.clientDetails.reciverClient.email} />
                    <DetailItem label="Receiver Phone" value={docket.clientDetails.reciverClient.phoneNumber} />
                    <DetailItem label="Receiver Address" value={docket.clientDetails.reciverClient.address} />
                    <DetailItem label="Receiver GST" value={docket.clientDetails.reciverClient.gstNumber} />
                    <DetailItem label="Consignee" value={docket.clientDetails.reciverClient.conssignee} />
                  </>
                )}
              </div>
            </div>
          </div>
          {/* Displaying Payment & GST Information */}
          <div className="mb-8 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
            <h2 className="text-xl font-semibold mb-4 text-indigo-600 dark:text-indigo-400">Payment & GST Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300 underline">Payment Details:</h3>
                <DetailItem label="Declared Value" value={docket.paymentDetails?.declaredValue} />
                <DetailItem label="Vendor" value={docket.paymentDetails?.vendor} />
                <DetailItem label="Actual Weight" value={`${docket.paymentDetails?.actualWeight || 0} kg`} />
                <DetailItem label="Chargeable Weight" value={`${docket.paymentDetails?.chargeWeight || 0} kg`} />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300 underline">GST Details:</h3>
                <DetailItem label="SGST" value={`₹ ${docket.paymentDetails?.gst?.sgst || 0}`} />
                <DetailItem label="CGST" value={`₹ ${docket.paymentDetails?.gst?.cgst || 0}`} />
                <DetailItem label="IGST" value={`₹ ${docket.paymentDetails?.gst?.igst || 0}`} />
                <DetailItem label="Total Amount" value={`₹ ${docket.paymentDetails?.total || 0}`} />
              </div>
              
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
};

export default DocketDetailPage;
