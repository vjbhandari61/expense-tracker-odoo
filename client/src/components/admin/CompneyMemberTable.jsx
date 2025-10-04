import React, { useState } from 'react';
import AddMemberModal from './AddMemberModal';

const CompanyMembersTable = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState([
    {
      id: 1,
      name: 'John Doe',
      role: 'Manager',
      manager: '',
      email: 'john.doe@company.com',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Jane Smith',
      role: 'Developer',
      manager: 'John Doe',
      email: 'jane.smith@company.com',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      role: 'Designer',
      manager: 'John Doe',
      email: 'mike.johnson@company.com',
      status: 'Active'
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      role: 'Manager',
      manager: '',
      email: 'sarah.wilson@company.com',
      status: 'Inactive'
    },
    {
      id: 5,
      name: 'Alex Brown',
      role: 'Developer',
      manager: 'Sarah Wilson',
      email: 'alex.brown@company.com',
      status: 'Active'
    },
    {
      id: 6,
      name: 'Emily Davis',
      role: 'Tester',
      manager: 'Sarah Wilson',
      email: 'emily.davis@company.com',
      status: 'Active'
    }
  ]);

  const handleSendPassword = (memberId) => {
    // Handle send password logic
    console.log('Sending password reset for member:', memberId);
    alert(`Password reset email sent to ${members.find(m => m.id === memberId)?.name}`);
  };

  const handleAddMember = (newMember) => {
    setMembers(prevMembers => [newMember, ...prevMembers]);
  };

  const getStatusColor = (status) => {
    return status === 'Active' ? 'text-green-400' : 'text-red-400';
  };

  const getStatusBadge = (status) => {
    return status === 'Active' 
      ? 'bg-green-900 text-green-300'
      : 'bg-red-900 text-red-300';
  };

  return (
    <div className="bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Company Members</h2>
          <p className="text-gray-400 text-sm sm:text-base mt-1">Manage your team members and their roles</p>
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
            {members
              .filter(member => {
                if (!searchTerm) return true;
                const searchLower = searchTerm.toLowerCase();
                return (
                  member.name.toLowerCase().includes(searchLower) ||
                  member.email.toLowerCase().includes(searchLower) ||
                  member.role.toLowerCase().includes(searchLower) ||
                  (member.manager && member.manager.toLowerCase().includes(searchLower))
                );
              })
              .map((member) => (
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
                  <div className="text-sm text-gray-300">{member.role}</div>
                </td>

                {/* Manager Column - Conditional Rendering */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">
                    {member.role === 'Manager' ? (
                      <span className="text-gray-500 italic">-</span>
                    ) : (
                      member.manager
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
        <div className="text-sm text-gray-400">
          Showing {members.filter(member => {
            if (!searchTerm) return true;
            const searchLower = searchTerm.toLowerCase();
            return (
              member.name.toLowerCase().includes(searchLower) ||
              member.email.toLowerCase().includes(searchLower) ||
              member.role.toLowerCase().includes(searchLower) ||
              (member.manager && member.manager.toLowerCase().includes(searchLower))
            );
          }).length} of {members.length} members
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition duration-200">
            Previous
          </button>
          <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition duration-200">
            Next
          </button>
        </div>
      </div>

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