import React from 'react';

const TrackingLogForm = ({ formData, handleChange, renderInput }) => {
  return (
    <fieldset className="p-4 border border-gray-300 dark:border-gray-700 rounded-md">
      <legend className="text-lg font-semibold px-2 text-gray-700 dark:text-gray-200">Initial Tracking Log (Optional)</legend>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {renderInput('trackingLogData', 'status', 'Status')}
        {renderInput('trackingLogData', 'location', 'Location')}
        {renderInput('trackingLogData', 'remarks', 'Remarks', 'textarea')}
      </div>
    </fieldset>
  );
};

export default TrackingLogForm;