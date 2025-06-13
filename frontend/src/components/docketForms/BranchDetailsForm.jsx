import React from 'react';

const BranchDetailsForm = ({ formData, handleChange, renderInput }) => {
  return (
    renderInput('branchData', 'name', 'Branch')
  );
};

export default BranchDetailsForm;
