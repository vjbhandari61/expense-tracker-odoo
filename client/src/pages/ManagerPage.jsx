import React, { useState } from 'react';

const ManagerPage = () => {
  const [approvals, setApprovals] = useState([
    {
      id: 1,
      approvalSubject: 'Restaurant Bill',
      requestOwner: 'Sarah',
      category: 'Food',
      requestStatus: 'Pending',
      totalAmount: '847.5',
      originalAmount: '1000',
      originalCurrency: 'USD',
      description: 'Client dinner meeting',
      date: '4th Oct, 2025'
    },
    {
      id: 2,
      approvalSubject: 'Hotel Booking',
      requestOwner: 'John',
      category: 'Travel',
      requestStatus: 'Pending',
      totalAmount: '1250.0',
      originalAmount: '1500',
      originalCurrency: 'EUR',
      description: 'Conference accommodation',
      date: '3rd Oct, 2025'
    },
    {
      id: 3,
      approvalSubject: 'Office Supplies',
      requestOwner: 'Mike',
      category: 'Office',
      requestStatus: 'Pending',
      totalAmount: '498.96',
      originalAmount: '500',
      originalCurrency: 'GBP',
      description: 'Stationery and printer ink',
      date: '2nd Oct, 2025'
    }
  ]);

  const handleApprove = (approvalId) => {
    setApprovals(prev => prev.map(approval => 
      approval.id === approvalId 
        ? { ...approval, requestStatus: 'Approved' }
        : approval
    ));
  };

  const handleReject = (approvalId) => {
    setApprovals(prev => prev.map(approval => 
      approval.id === approvalId 
        ? { ...approval, requestStatus: 'Rejected' }
        : approval
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-900 text-green-300';
      case 'Rejected':
        return 'bg-red-900 text-red-300';
      case 'Pending':
        return 'bg-yellow-900 text-yellow-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  const pendingApprovals = approvals.filter(approval => approval.requestStatus === 'Pending');
  const processedApprovals = approvals.filter(approval => approval.requestStatus !== 'Pending');

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="h-full">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Manager's View</h1>
            <p className="text-gray-400">Review and approve expense requests from your team</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-900 bg-opacity-50 p-4 rounded-lg border border-blue-700">
              <div className="text-blue-300 text-sm font-semibold">Pending Approvals</div>
              <div className="text-2xl font-bold text-blue-100">{pendingApprovals.length}</div>
            </div>
            <div className="bg-green-900 bg-opacity-50 p-4 rounded-lg border border-green-700">
              <div className="text-green-300 text-sm font-semibold">Approved This Month</div>
              <div className="text-2xl font-bold text-green-100">
                {processedApprovals.filter(a => a.requestStatus === 'Approved').length}
              </div>
            </div>
            <div className="bg-yellow-900 bg-opacity-50 p-4 rounded-lg border border-yellow-700">
              <div className="text-yellow-300 text-sm font-semibold">Total Processed</div>
              <div className="text-2xl font-bold text-yellow-100">{processedApprovals.length}</div>
            </div>
          </div>

          {/* Approvals to Review Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Approvals to review</h2>
            
            {pendingApprovals.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-gray-700">
                <table className="w-full min-w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Approval Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Request Owner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Request Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Total amount (in company's currency)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {pendingApprovals.map((approval) => (
                      <tr key={approval.id} className="hover:bg-gray-750 transition duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">{approval.approvalSubject}</div>
                            <div className="text-xs text-gray-400">{approval.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{approval.requestOwner}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{approval.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(approval.requestStatus)}`}>
                            {approval.requestStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-white">{approval.totalAmount} USD</div>
                          <div className="text-xs text-gray-400">
                            {approval.originalAmount} {approval.originalCurrency} converted
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(approval.id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(approval.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-700 rounded-lg border border-gray-600">
                <div className="text-gray-400">No pending approvals to review</div>
                <div className="text-gray-500 text-sm mt-1">All expense requests have been processed</div>
              </div>
            )}
          </div>

          {/* Processed Approvals Section */}
          {processedApprovals.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Processed Approvals</h2>
              <div className="overflow-x-auto rounded-lg border border-gray-700">
                <table className="w-full min-w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Approval Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Request Owner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Request Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Total amount (in company's currency)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Date Processed
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {processedApprovals.map((approval) => (
                      <tr key={approval.id} className="hover:bg-gray-750 transition duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">{approval.approvalSubject}</div>
                            <div className="text-xs text-gray-400">{approval.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{approval.requestOwner}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{approval.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(approval.requestStatus)}`}>
                            {approval.requestStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-white">{approval.totalAmount} USD</div>
                          <div className="text-xs text-gray-400">
                            {approval.originalAmount} {approval.originalCurrency} converted
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{approval.date}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerPage;