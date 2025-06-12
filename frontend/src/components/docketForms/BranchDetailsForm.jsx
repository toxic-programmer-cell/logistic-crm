import React from 'react';

const BranchDetailsForm = ({ formData, handleChange, renderInput }) => {
  return (
    <fieldset className="p-4 border border-gray-300 dark:border-gray-700 rounded-md">
      <legend className="text-lg font-semibold px-2 text-gray-700 dark:text-gray-200">Branch Details (Optional)</legend>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {renderInput('branchData', 'name', 'Branch Name')}
        {/* Add more branch fields here if needed, e.g., address, city */}
        {/* {renderInput('branchData', 'address', 'Branch Address')} */}
      </div>
    </fieldset>
  );
};

export default BranchDetailsForm;
