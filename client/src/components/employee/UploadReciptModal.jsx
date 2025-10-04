import React, { useState } from 'react';
import axios from 'axios';

const UploadReceiptModal = ({ isOpen, onClose, onExpenseCreated }) => {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const [uploadedFile, setUploadedFile] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    category: '',
    totalAmount: '',
    currency: 'USD',
    paidBy: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [approvalHistory, setApprovalHistory] = useState([]);

  const categories = ['Food', 'Travel', 'Office Supplies', 'Entertainment', 'Other'];
  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'];

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ml_default'); // Use your upload preset name
      formData.append('cloud_name', 'dduer2rjc'); // Your cloud name
      formData.append('folder', 'expense_receipts'); // Optional: organize files in a folder

      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dduer2rjc/image/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const imageUrl = response.data.secure_url;
      console.log('Uploaded to Cloudinary:', imageUrl);

      // Continue with OCR simulation
      setTimeout(() => {
        setIsProcessing(false);
        setFormData(prev => ({
          ...prev,
          description: `Receipt: ${file.name.split('.')[0]}`,
          category: 'Food',
          totalAmount: '567',
          paidBy: 'Employee'
        }));
      }, 1500);

    } catch (error) {
      console.error('Cloudinary Upload Error:', {
        message: error.message,
        response: error.response?.data,
        config: {
          url: error.config?.url,
          headers: error.config?.headers
        }
      });
      setIsProcessing(false);
      alert(`Upload failed: ${error.response?.data?.message || error.message}. Please try again.`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!uploadedFile) {
      alert('Please upload a receipt first');
      return;
    }

    // Simulate submission
    setIsSubmitted(true);
    setApprovalHistory([
      {
        approver: 'Sarah',
        status: 'Approved',
        time: '12:44 4th Oct, 2025'
      }
    ]);

    // Call parent callback with expense data
    if (onExpenseCreated) {
      const expenseData = {
        ...formData,
        id: Date.now(),
        file: uploadedFile,
        status: 'Pending Approval',
        submittedAt: new Date().toISOString()
      };
      onExpenseCreated(expenseData);
    }
  };

  const handleClose = () => {
    setUploadedFile(null);
    setFormData({
      description: '',
      category: '',
      totalAmount: '',
      currency: 'USD',
      paidBy: ''
    });
    setIsProcessing(false);
    setIsSubmitted(false);
    setApprovalHistory([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header with close button */}
        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white">Upload Receipt</h3>
            <p className="text-gray-400 text-sm mt-1">
              {isSubmitted ? "Expense submitted successfully" : "Upload receipt and fill expense details"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {/* Upload Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload Receipt
              </label>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition duration-200">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={isProcessing}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer block"
              >
                <div className="text-gray-500 mb-3">
                  <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m-4 4v12" />
                  </svg>
                </div>
                <div className="text-sm text-gray-400">
                  <span className="text-blue-400 font-medium">Upload receipt</span> or drag and drop
                </div>
                <div className="text-xs text-gray-500 mt-1">PNG, JPG, PDF (max 10MB)</div>
              </label>
            </div>

            {isProcessing && (
              <div className="mt-4 p-3 bg-blue-900 bg-opacity-50 rounded-lg border border-blue-700">
                <div className="text-sm text-blue-300">Processing receipt with OCR...</div>
                <div className="w-full bg-blue-800 rounded-full h-2 mt-2">
                  <div className="bg-blue-500 h-2 rounded-full animate-pulse"></div>
                </div>
              </div>
            )}

            {uploadedFile && !isProcessing && (
              <div className="mt-4 p-3 bg-green-900 bg-opacity-50 rounded-lg border border-green-700">
                <div className="text-sm text-green-300 flex items-center justify-between">
                  <span>✓ {uploadedFile.name}</span>
                  <span className="text-green-400">OCR Complete</span>
                </div>
              </div>
            )}
          </div>

          {/* Expense Details Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="Enter expense description"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 appearance-none cursor-pointer"
                  required
                >
                  <option value="" className="text-gray-400">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="bg-gray-700 text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount and Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Total Amount
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="totalAmount"
                    value={formData.totalAmount}
                    onChange={handleChange}
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    placeholder="0.00"
                    required
                  />
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 appearance-none cursor-pointer w-24"
                  >
                    {currencies.map(curr => (
                      <option key={curr} value={curr} className="bg-gray-700 text-white">
                        {curr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Paid By */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Paid By
                </label>
                <input
                  type="text"
                  name="paidBy"
                  value={formData.paidBy}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="Who paid for this?"
                  required
                />
              </div>
              </div>
                </div>
            
            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200 font-semibold"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Submit Expense'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Expense Submitted!</h3>
              <p className="text-gray-400 mb-6">Your expense has been submitted for approval.</p>
              
              <button
                onClick={handleClose}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadReceiptModal;