import React from 'react';

const ReceiverClientDetailsForm = ({ formData, handleChange, renderInput }) => {
  return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {renderInput('reciverClientData', 'fullName', 'Full Name')}
        {renderInput('reciverClientData', 'email', 'Email', 'email')}
        {renderInput('reciverClientData', 'phoneNumber', 'Phone Number', 'tel')}
        {renderInput('reciverClientData', 'address', 'Address')}
        {renderInput('reciverClientData', 'gstNumber', 'GST Number')}
        {renderInput('reciverClientData', 'conssignee', 'Consignee')}
      </div>
  );
};

export default ReceiverClientDetailsForm;