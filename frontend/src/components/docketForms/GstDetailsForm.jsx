import React from 'react';

const GstDetailsForm = ({ formData, handleChange, renderInput }) => {
  return (
    <fieldset className="p-4 border border-gray-300 dark:border-gray-700 rounded-md">
      <legend className="text-lg font-semibold px-2 text-gray-700 dark:text-gray-200">GST Details</legend>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {renderInput('gstData', 'sgst', 'SGST Amount', 'number', true)}
        {renderInput('gstData', 'cgst', 'CGST Amount', 'number', true)}
        {renderInput('gstData', 'igst', 'IGST Amount', 'number', true)}
      </div>
    </fieldset>
  );
};

export default GstDetailsForm;