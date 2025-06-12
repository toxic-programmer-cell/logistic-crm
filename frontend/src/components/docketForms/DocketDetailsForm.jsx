import React from 'react';

const DocketDetailsForm = ({ formData, handleChange, renderInput }) => {
  return (
    <fieldset className="p-4 border border-gray-300 dark:border-gray-700 rounded-md">
      <legend className="text-lg font-semibold px-2 text-gray-700 dark:text-gray-200">Docket Details</legend>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {renderInput('docketData', 'docketNumber', 'Docket Number', 'text', true)}
        {renderInput('docketData', 'date', 'Date', 'date')}
        {renderInput('docketData', 'origin', 'Origin', 'text', true)}
        {renderInput('docketData', 'destination', 'Destination', 'text', true)}
        {renderInput('docketData', 'payType', 'Payment Type', 'text', true)}
        {renderInput('docketData', 'mode', 'Mode of Transport', 'text', true)}
        {renderInput('docketData', 'packType', 'Package Type', 'text', true)}
        {renderInput('docketData', 'item', 'Item Description', 'text', true)}
        {renderInput('docketData', 'docketStatus', 'Docket Status', 'text', true)}
      </div>
    </fieldset>
  );
};

export default DocketDetailsForm;