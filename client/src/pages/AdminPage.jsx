import { useState, useEffect } from 'react';
import CompanyMembersTable from "../components/admin/CompneyMemberTable";

const AdminPage = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage your team members and company settings</p>
        </div>

        {/* Main Content */}
        <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <CompanyMembersTable />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;