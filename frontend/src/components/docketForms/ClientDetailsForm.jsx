import React from 'react';

const ClientDetailsForm = ({ formData, handleChange, renderInput }) => {
  return (
    <fieldset className="p-4 border border-gray-300 dark:border-gray-700 rounded-md">
      <legend className="text-lg font-semibold px-2 text-gray-700 dark:text-gray-200">Client Details</legend>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {renderInput('clientData', 'fullName', 'Full Name', 'text', true)}
        {renderInput('clientData', 'email', 'Email', 'email', true)}
        {renderInput('clientData', 'phoneNumber', 'Phone Number', 'tel', true)}
        {renderInput('clientData', 'address', 'Address', 'text', true)}
        {renderInput('clientData', 'gstNumber', 'GST Number', 'text', true)}
        {renderInput('clientData', 'consignor', 'Consignor', 'text', true)}
      </div>
    </fieldset>
  );
};

export default ClientDetailsForm;