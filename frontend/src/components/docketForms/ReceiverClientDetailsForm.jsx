import React from 'react';

const ReceiverClientDetailsForm = ({ formData, handleChange, renderInput }) => {
  return (
    <fieldset className="p-4 border border-gray-300 dark:border-gray-700 rounded-md">
      <legend className="text-lg font-semibold px-2 text-gray-700 dark:text-gray-200">Receiver Client Details</legend>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {renderInput('reciverClientData', 'fullName', 'Full Name')}
        {renderInput('reciverClientData', 'email', 'Email', 'email')}
        {renderInput('reciverClientData', 'phoneNumber', 'Phone Number', 'tel')}
        {renderInput('reciverClientData', 'address', 'Address')}
        {renderInput('reciverClientData', 'gstNumber', 'GST Number')}
        {renderInput('reciverClientData', 'conssignee', 'Consignee')}
      </div>
    </fieldset>
  );
};

export default ReceiverClientDetailsForm;