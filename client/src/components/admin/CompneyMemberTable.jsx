import React, { useState, useEffect } from 'react';
import AddMemberModal from './AddMemberModal';
import { getUsers, createUser } from '../../util/requester'; // Adjust path as needed

const CompanyMembersTable = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Fetch members from API
  const fetchMembers = async (page = 1, limit = 10) => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await getUsers({
        page,
        limit,
        search: searchTerm || undefined
      });
      
      console.log("API Response:", response);
      
      if (response.success && response.data) {
        // Transform API data to match our table structure
        const transformedMembers = response.data.users.map(user => ({
          id: user._id || user.id,
          name: user.name,
          role: user.role,
          manager: user.manager?.name || '',
          email: user.email,
          status: user.is_active ? 'Active' : 'Inactive',
          // Keep original data for reference
          originalData: user
        }));
        
        setMembers(transformedMembers);
        setPagination(response.data.pagination || {
          page,
          limit,
          total: response.data.total || transformedMembers.length,
          pages: Math.ceil((response.data.total || transformedMembers.length) / limit)
        });
      } else {
        throw new Error(response.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load members');
      
      // Fallback to empty array if API fails
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and when search term changes
  useEffect(() => {
    fetchMembers(1, pagination.limit);
  }, [searchTerm]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchMembers(newPage, pagination.limit);
    }
  };

  const handleSendPassword = async (memberId) => {
    try {
      // You'll need to implement this API method
      console.log('Sending password reset for member:', memberId);
      
      // Find member for display
      const member = members.find(m => m.id === memberId);
      if (member) {
        alert(`Password reset email sent to ${member.name}`);
      }
    } catch (error) {
      console.error('Error sending password:', error);
      alert('Failed to send password reset email');
    }
  };

  const handleAddMember = async (newMember) => {
    try {
      // Call the API to create user
      const response = await createUser({
        name: newMember.name,
        email: newMember.email,
        role: newMember.role,
        manager: newMember.manager || undefined
      });

      if (response.success) {
        // Refresh the members list
        await fetchMembers(pagination.page, pagination.limit);
        alert('Member added successfully!');
      } else {
        throw new Error(response.message || 'Failed to add member');
      }
    } catch (error) {
      console.error('Error adding member:', error);
      alert(error.response?.data?.message || error.message || 'Failed to add member');
    }
  };

  const getStatusColor = (status) => {
    return status === 'Active' ? 'text-green-400' : 'text-red-400';
  };

  const getStatusBadge = (status) => {
    return status === 'Active' 
      ? 'bg-green-900 text-green-300'
      : 'bg-red-900 text-red-300';
  };

  // Loading state
  if (isLoading && members.length === 0) {
    return (
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-white">Loading members...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Company Members</h2>
          <p className="text-gray-400 text-sm sm:text-base mt-1">
            {pagination.total} team members
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 sm:px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm w-full sm:w-48"
          />
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 whitespace-nowrap text-sm flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Member
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="w-full min-w-full">
          {/* Table Header */}
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Manager
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          
          {/* Table Body */}
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {members.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-400">
                  {isLoading ? 'Loading...' : 'No members found'}
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-750 transition duration-150">
                  {/* User Column */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-white">{member.name}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role Column */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300 capitalize">{member.role}</div>
                  </td>

                  {/* Manager Column - Conditional Rendering */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {member.role === 'manager' || member.role === 'admin' ? (
                        <span className="text-gray-500 italic">-</span>
                      ) : (
                        member.manager || <span className="text-gray-500 italic">No manager</span>
                      )}
                    </div>
                  </td>

                  {/* Email Column */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{member.email}</div>
                  </td>

                  {/* Status Column */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(member.status)}`}>
                      {member.status}
                    </span>
                  </td>

                  {/* Actions Column */}
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleSendPassword(member.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                    >
                      Send Password
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      {members.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
          <div className="text-sm text-gray-400">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} members
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className={`px-3 py-1 rounded text-sm transition duration-200 ${
                pagination.page <= 1 
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-300">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button 
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className={`px-3 py-1 rounded text-sm transition duration-200 ${
                pagination.page >= pagination.pages
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      <AddMemberModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddMember={handleAddMember}
      />
    </div>
  );
};

export default CompanyMembersTable;