import React, { useState } from 'react';

const AddMemberModal = ({ isOpen, onClose, onAddMember }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    manager: ''
  });

  const [errors, setErrors] = useState({});

  const roles = ['Employee', 'Manager'];
  const managers = [
    { id: 1, name: 'John Doe', role: 'Manager' },
    { id: 2, name: 'Sarah Wilson', role: 'Manager' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (formData.role === 'Employee' && !formData.manager) {
      newErrors.manager = 'Manager is required for this role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onAddMember({
        ...formData,
        id: Date.now(), // Generate unique ID
        status: 'Active' // Default status for new members
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      role: '',
      manager: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">Add New Member</h3>
          <p className="text-gray-400 text-sm mt-1">Add a new member to your company</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                errors.name ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Enter full name"
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                errors.email ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Role Dropdown */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
              Role *
            </label>
            <div className="relative">
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 appearance-none cursor-pointer ${
                  errors.role ? 'border-red-500' : 'border-gray-600'
                }`}
              >
                <option value="" className="text-gray-400">Select a role</option>
                {roles.map((role) => (
                  <option key={role} value={role} className="bg-gray-700 text-white">
                    {role}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.role && (
              <p className="text-red-400 text-xs mt-1">{errors.role}</p>
            )}
          </div>

          {/* Manager Dropdown - Only show if role is not Executive */}
          {formData.role === 'Employee' && (
            <div>
              <label htmlFor="manager" className="block text-sm font-medium text-gray-300 mb-2">
                Manager *
              </label>
              <div className="relative">
                <select
                  id="manager"
                  name="manager"
                  value={formData.manager}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 appearance-none cursor-pointer ${
                    errors.manager ? 'border-red-500' : 'border-gray-600'
                  }`}
                >
                  <option value="" className="text-gray-400">Select a manager</option>
                  {managers
                    .filter(manager => manager.role === 'Manager')
                    .map((manager) => (
                      <option key={manager.id} value={manager.name} className="bg-gray-700 text-white">
                        {manager.name} ({manager.role})
                      </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors.manager && (
                <p className="text-red-400 text-xs mt-1">{errors.manager}</p>
              )}
            </div>
          )}

        </form>

        {/* Footer Buttons */}
        <div className="px-6 py-4 border-t border-gray-700 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create Member
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;