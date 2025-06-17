import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import ClientDetailsForm from '../components/docketForms/ClientDetailsForm';
import ReceiverClientDetailsForm from '../components/docketForms/ReceiverClientDetailsForm';
import DocketDetailsForm from '../components/docketForms/DocketDetailsForm';
import PaymentDetailsForm from '../components/docketForms/PaymentDetailsForm';
import BranchDetailsForm from '../components/docketForms/BranchDetailsForm';
import TrackingLogForm from '../components/docketForms/TrackingLogForm';
import { toast } from 'react-toastify';

const CreateDocketPages = () => {
    const [formData, setFormData] = useState({
    reciverClientData: { // Optional, but if provided, fields below are required by backend
      fullName: '',
      email: '',
      phoneNumber: '',
      address: '',
      gstNumber: '',
      conssignee: '', // Note: Backend has a typo 'conssignee' instead of 'consignee'
    },
    gstData: { // Required
      sgst: 0,
      cgst: 0,
      igst: 0,
    },
    paymentDetailData: { // Required
      declaredValue: 0,
      vendor: '',
      vendorNumber: '',
      fwdNetwork: '',
      fwdNumber: '',
      pkts: 0,
      actualWeight: 0,
      chargeWeight: 0,
      rate: 0,
      frieghtOn: '', // Note: Backend has a typo 'frieghtOn' instead of 'freightOn'
      clearence: 0,  // Note: Backend has a typo 'clearence' instead of 'clearance'
      otherC: 0,
      total: 0,
    },
    clientData: { // Required
      fullName: '',
      email: '',
      phoneNumber: '',
      address: '',
      gstNumber: '',
      consignor: '',
    },
    docketData: { // Required
      docketNumber: '',
      origin: '',
      destination: '',
      payType: '',
      mode: '',
      packType: '',
      item: '',
      docketStatus: '',
      date: '', // Optional, defaults to current date on backend if not sent or empty
    },
    branchData: { // Optional
      name: '',
      // Add other branch fields if necessary, e.g., address, city
    },
    trackingLogData: { // Optional
      status: '',
      location: '',
      remarks: '',
    },
  });

  const [loading, setLoading] = useState(false);

  const handleNestedChange = (section, e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('accessToken');
    // console.log('Token being sent:', token);
    if (!token) {
      toast.error( 'Authentication error: No token found. Please log in again.');
      setLoading(false);
      return;
    }

    const payload = {
      gstData: {
        sgst: parseFloat(formData.gstData.sgst) || 0,
        cgst: parseFloat(formData.gstData.cgst) || 0,
        igst: parseFloat(formData.gstData.igst) || 0,
      },
      paymentDetailData: {
        ...formData.paymentDetailData,
        declaredValue: parseFloat(formData.paymentDetailData.declaredValue) || 0,
        pkts: parseFloat(formData.paymentDetailData.pkts) || 0,
        actualWeight: parseFloat(formData.paymentDetailData.actualWeight) || 0,
        chargeWeight: parseFloat(formData.paymentDetailData.chargeWeight) || 0,
        rate: parseFloat(formData.paymentDetailData.rate) || 0,
        clearence: parseFloat(formData.paymentDetailData.clearence) || 0,
        otherC: parseFloat(formData.paymentDetailData.otherC) || 0,
        total: parseFloat(formData.paymentDetailData.total) || 0,
      },
      clientData: formData.clientData,
      docketData: formData.docketData.date === '' ? { ...formData.docketData, date: undefined } : formData.docketData,
    };

    const hasReciverClientData = Object.values(formData.reciverClientData).some(val => typeof val === 'string' && val.trim() !== '');
    if (hasReciverClientData) {
      payload.reciverClientData = formData.reciverClientData;
    }

    if (formData.branchData.name && formData.branchData.name.trim() !== '') {
      payload.branchData = formData.branchData;
    }

    if (formData.trackingLogData.status && formData.trackingLogData.status.trim() !== '' &&
        formData.trackingLogData.location && formData.trackingLogData.location.trim() !== '') {
      payload.trackingLogData = formData.trackingLogData;
    }

    try {
        const response = await axiosInstance.post('/dockets/', payload)

      // const result = response.data;

      toast.success( 'Docket entry created successfully!' );
    } catch (error) {
        console.error("Error creating docket entry:", error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to create docket entry.';
        toast.error( errorMessage );
    } finally {
      setLoading(false);
    }
  };

   // Helper to generate input fields
  const renderInput = (section, name, label, type = 'text', required = false, props = {}) => (
    <div className="mb-4">
      <label htmlFor={`${section}-${name}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}{required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        id={`${section}-${name}`}
        value={formData[section][name]}
        onChange={(e) => handleNestedChange(section, e)}
        required={required}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
        step={type === "number" ? "any" : undefined}
        {...props}
      />
    </div>
  );

  return (
    <div className="container mx-auto p-4 bg-white dark:bg-gray-800 min-h-screen">
      <div className="flex items-start mb-6"> {/* Use items-start to align the tops */}
        <h1 className="text-2xl w-auto font-bold text-gray-800 dark:text-gray-100 self-center mr-6">Create New Docket Entry</h1>
        <div className="w-auto max-w-xs mr-6 flex-shrink-0"> {/* Controls width of BranchDetailsForm and prevents shrinking */}
          <BranchDetailsForm formData={formData.branchData} handleChange={handleNestedChange} renderInput={renderInput} />
        </div>
      </div>


      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Docket Detail */}
        <DocketDetailsForm formData={formData.docketData} handleChange={handleNestedChange} renderInput={renderInput} />

        <fieldset className="p-4 border border-gray-300 dark:border-gray-700 rounded-md">
          <legend className="text-lg font-semibold px-2 text-gray-700 dark:text-gray-200">Client Details</legend>
          <div className="flex flex-col md:flex-row md:space-x-8 space-y-8 md:space-y-0">
            <div className="flex-1"><ClientDetailsForm formData={formData.clientData} handleChange={handleNestedChange} renderInput={renderInput} /></div>
            <div className="hidden md:block w-px bg-gray-300 dark:bg-gray-700" />
            <div className="flex-1"><ReceiverClientDetailsForm formData={formData.reciverClientData} handleChange={handleNestedChange} renderInput={renderInput} /></div>
          </div>
        </fieldset>

        <PaymentDetailsForm formData={formData.paymentDetailData} handleChange={handleNestedChange} renderInput={renderInput} />

        <TrackingLogForm formData={formData.trackingLogData} handleChange={handleNestedChange} renderInput={renderInput} />

        <div className="pt-5">
          <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50">
            {loading ? 'Submitting...' : 'Create Docket Entry'}
          </button>
        </div>
      </form>
    </div>
  );
};


export default CreateDocketPages;