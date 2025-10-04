import React, { useState } from 'react';
import UploadReceiptModal from "./UploadReciptModal"

const EmployeeViewTable = () => {
  const [expenses, setExpenses] = useState([
    {
      id: 1,
      employee: 'Sarah',
      description: 'Restaurant bill',
      date: '4th Oct, 2025',
      category: 'Food',
      paidBy: 'Sarah',
      remarks: 'None',
      amount: '5000 rs',
      status: 'Submitted'
    },
    {
      id: 2,
      employee: 'John',
      description: 'Office supplies',
      date: '3rd Oct, 2025',
      category: 'Office',
      paidBy: 'John',
      remarks: 'Pens and notebooks',
      amount: '1500 rs',
      status: 'Approved'
    },
    {
      id: 3,
      employee: 'Mike',
      description: 'Client meeting',
      date: '2nd Oct, 2025',
      category: 'Entertainment',
      paidBy: 'Mike',
      remarks: 'Business lunch',
      amount: '8000 rs',
      status: 'Waiting Approval'
    }
  ]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const stats = {
    toSubmit: '5467 rs',
    waitingApproval: '33674 rs',
    approved: '500 rs'
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      setTimeout(() => {
        const newExpense = {
          id: expenses.length + 1,
          employee: 'You',
          description: `Receipt: ${file.name}`,
          date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
          category: 'Pending',
          paidBy: 'You',
          remarks: 'Auto-generated from receipt',
          amount: 'Calculating...',
          status: 'Processing'
        };
        setExpenses(prev => [newExpense, ...prev]);
        setShowUploadModal(false);
      }, 2000);
    }
  };

  const handleTakePhoto = () => {
    alert("Camera access would be implemented here for mobile devices");
  };

  const handleExpenseCreated = (expenseData) => {
    const newExpense = {
      id: expenses.length + 1,
      employee: 'You',
      description: expenseData.description,
      date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      category: expenseData.category,
      paidBy: expenseData.paidBy,
      remarks: 'Pending approval',
      amount: `${expenseData.totalAmount} ${expenseData.currency}`,
      status: 'Submitted'
    };
    setExpenses(prev => [newExpense, ...prev]);
    setShowUploadModal(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-900 text-blue-300';
      case 'Approved':
        return 'bg-green-900 text-green-300';
      case 'Waiting Approval':
        return 'bg-yellow-900 text-yellow-300';
      case 'Processing':
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-800 rounded-2xl shadow-2xl p-6">
      {/* Header Section */}
      <div className="flex-shrink-0 mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Employee's</h1>
        <p className="text-gray-400 mb-6">
          Upload a receipt from your computer 
        </p>

        {/* Upload Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-200 font-semibold transform hover:scale-105"
          >
            Upload Receipt
          </button>
         
        </div>

      
      </div>

      {/* Expenses Table - Flexible Height */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto rounded-lg border border-gray-700 flex-1">
          <table className="w-full min-w-full">
            {/* Table Header */}
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Paid By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Remarks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            
            {/* Table Body */}
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-750 transition duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{expense.employee}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{expense.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{expense.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{expense.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{expense.paidBy}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-400">{expense.remarks}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-white">{expense.amount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(expense.status)}`}>
                      {expense.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadReceiptModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onExpenseCreated={handleExpenseCreated}
      />
    </div>
  );
};

export default EmployeeViewTable;