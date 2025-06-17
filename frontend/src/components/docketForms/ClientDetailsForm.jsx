import React from 'react';

const ClientDetailsForm = ({ formData, handleChange, renderInput }) => {
  return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {renderInput('clientData', 'fullName', 'Full Name', 'text', true)}
        {renderInput('clientData', 'email', 'Email', 'email', true)}
        {renderInput('clientData', 'phoneNumber', 'Phone Number', 'tel', true)}
        {renderInput('clientData', 'address', 'Address', 'text', true)}
        {renderInput('clientData', 'gstNumber', 'GST Number', 'text', true)}
        {renderInput('clientData', 'consignor', 'Consignor', 'text', true)}
      </div>
  );
};

export default ClientDetailsForm;