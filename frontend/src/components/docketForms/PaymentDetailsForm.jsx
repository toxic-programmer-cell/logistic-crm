import React from 'react';

const PaymentDetailsForm = ({ formData, gstFormData, handleChange, renderInput, children }) => {
  return (
    <fieldset className="p-4 border border-gray-300 dark:border-gray-700 rounded-md">
      <legend className="text-lg font-semibold px-2 text-gray-700 dark:text-gray-200">Payment Details</legend>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {renderInput('paymentDetailData', 'declaredValue', 'Declared Value', 'number', true)}
        {renderInput('paymentDetailData', 'vendor', 'Vendor', 'text', true)}
        {renderInput('paymentDetailData', 'vendorNumber', 'Vendor Number', 'text', true)}
        {renderInput('paymentDetailData', 'fwdNetwork', 'Forwarding Network', 'text', true)}
        {renderInput('paymentDetailData', 'fwdNumber', 'Forwarding Number', 'text', true)}
        {renderInput('paymentDetailData', 'pkts', 'Packets (Pkts)', 'number', true)}
        {renderInput('paymentDetailData', 'actualWeight', 'Actual Weight (kg)', 'number', true)}
        {renderInput('paymentDetailData', 'chargeWeight', 'Chargeable Weight (kg)', 'number', true)}
        {renderInput('paymentDetailData', 'rate', 'Rate', 'number', true)}
        {renderInput('paymentDetailData', 'frieghtOn', 'Freight On (Backend: frieghtOn)', 'text', true)}
        {renderInput('paymentDetailData', 'clearence', 'Clearance Charges (Backend: clearence)', 'number', true)}
        {renderInput('paymentDetailData', 'otherC', 'Other Charges', 'number', true)}
      </div>
      {/* GST Details Integrated Here */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {renderInput('gstData', 'sgst', 'SGST Amount', 'number', true)}
        {renderInput('gstData', 'cgst', 'CGST Amount', 'number', true)}
        {renderInput('gstData', 'igst', 'IGST Amount', 'number', true)}
        {renderInput('paymentDetailData', 'total', 'Total Amount', 'number', true)}
      </div>
      {/* <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4'>
        {renderInput('paymentDetailData', 'total', 'Total Amount', 'number', true)}
      </div> */}
    </fieldset>
  );
};

export default PaymentDetailsForm;