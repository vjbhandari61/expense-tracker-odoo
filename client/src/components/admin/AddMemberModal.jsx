import React, { useState, useEffect } from 'react';
import { createUser, getManagers } from '../../util/requester';

const AddMemberModal = ({ isOpen, onClose, onAddMember }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employee',
    manager: ''
  });

  const [errors, setErrors] = useState({});
  const [managers, setManagers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roles = [
    { value: 'employee', label: 'Employee' },
    { value: 'manager', label: 'Manager' }
  ];

  // Fetch managers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchManagers();
      // Reset form when modal opens
      setFormData({
        name: '',
        email: '',
        role: 'employee',
        manager: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  const fetchManagers = async () => {
    try {
      setIsLoading(true);
      const response = await getManagers();
      
      if (response.success && response.data) {
        setManagers(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch managers');
      }
    } catch (error) {
      console.error('Error fetching managers:', error);
      setErrors({ general: 'Failed to load managers. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If role changes to manager, clear the manager field
    if (name === 'role' && value === 'manager') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        manager: '' // Clear manager when role is set to manager
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear general error when user makes any change
    if (errors.general) {
      setErrors(prev => ({
        ...prev,
        general: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (formData.email.length > 100) {
      newErrors.email = 'Email must be less than 100 characters';
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Role is required';
    } else if (!['employee', 'manager'].includes(formData.role)) {
      newErrors.role = 'Please select a valid role';
    }

    // Manager validation - only for employees
    if (formData.role === 'employee') {
      if (!formData.manager) {
        newErrors.manager = 'Manager is required for employees';
      } else if (!managers.some(manager => manager._id === formData.manager)) {
        newErrors.manager = 'Please select a valid manager';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare data for API - ensure it matches backend expectations
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(), // Normalize email
        role: formData.role
      };

      // Handle manager assignment based on role
      if (formData.role === 'employee' && formData.manager) {
        // Ensure manager ID is properly formatted
        userData.manager = formData.manager;
      }
      // For managers, don't include manager field or set to null based on your backend requirements
      // If your backend expects manager to be explicitly null for managers, add:
      // else if (formData.role === 'manager') {
      //   userData.manager = null;
      // }

      console.log('Submitting user data:', userData);

      const response = await createUser(userData);
      
      if (response.success) {
        console.log('User created successfully:', response.data);
        
        // Transform the API response to match your table structure
        const newMember = {
          id: response.data._id || response.data.id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
          manager: response.data.manager?.name || 'None',
          status: 'Active'
        };
        
        // Call the parent callback with the new member data
        onAddMember(newMember);
        
        handleClose();
        
        // Show success message
        alert('User created successfully! The default password is "Welcome123"');
      } else {
        // Handle API response errors
        const errorMessage = response.message || 'Failed to create user';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      
      // Enhanced error handling
      let errorMessage = 'Failed to create user. Please try again.';
      
      // Handle different types of errors
      if (error.response) {
        // Backend returned an error response
        const backendError = error.response.data;
        
        if (backendError.message) {
          errorMessage = backendError.message;
        }
        
        // Handle specific backend validation errors
        if (backendError.errors) {
          const backendErrors = {};
          backendError.errors.forEach(err => {
            if (err.path) {
              backendErrors[err.path] = err.msg;
            }
          });
          
          if (Object.keys(backendErrors).length > 0) {
            setErrors(backendErrors);
            return; // Don't set general error if we have field-specific errors
          }
        }
        
        // Handle specific error cases
        if (errorMessage.includes('email already exists') || errorMessage.includes('duplicate')) {
          setErrors({ email: 'A user with this email already exists' });
          return;
        } else if (errorMessage.includes('manager') || errorMessage.includes('Manager')) {
          setErrors({ manager: 'Selected manager not found or invalid' });
          return;
        } else if (errorMessage.includes('admin') || errorMessage.includes('permission')) {
          errorMessage = 'You do not have permission to create users. Only admins can create users.';
        } else if (errorMessage.includes('validation') || errorMessage.includes('Validation')) {
          errorMessage = 'Please check all fields and ensure they meet the requirements.';
        }
      } else if (error.request) {
        // Network error - no response received
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        // Other errors
        errorMessage = error.message || 'An unexpected error occurred.';
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      role: 'employee',
      manager: ''
    });
    setErrors({});
    onClose();
  };

  // Don't render if modal is not open
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
          {/* General Error */}
          {errors.general && (
            <div className="p-3 bg-red-900 border border-red-700 text-red-200 rounded-lg text-sm">
              {errors.general}
            </div>
          )}

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
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="Enter full name"
              disabled={isSubmitting}
              maxLength={50}
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
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="Enter email address"
              disabled={isSubmitting}
              maxLength={100}
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
                className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 appearance-none ${
                  errors.role ? 'border-red-500' : 'border-gray-600'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                disabled={isSubmitting}
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value} className="bg-gray-700 text-white">
                    {role.label}
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

          {/* Manager Dropdown - Only show for employees */}
          {formData.role === 'employee' && (
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
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 appearance-none ${
                    errors.manager ? 'border-red-500' : 'border-gray-600'
                  } ${isSubmitting || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  disabled={isSubmitting || isLoading}
                >
                  <option value="" className="text-gray-400">
                    {isLoading ? 'Loading managers...' : 'Select a manager'}
                  </option>
                  {managers.map((manager) => (
                    <option key={manager._id} value={manager._id} className="bg-gray-700 text-white">
                      {manager.name} ({manager.email})
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
              {managers.length === 0 && !isLoading && (
                <p className="text-yellow-400 text-xs mt-1">
                  No managers available. Please create a manager first.
                </p>
              )}
            </div>
          )}

          {/* Info message */}
          <div className="p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
            <p className="text-blue-300 text-sm">
              {formData.role === 'manager' 
                ? 'Managers can approve expenses and manage team members.'
                : 'New users will receive the default password "Welcome123". They should change it after first login.'
              }
            </p>
          </div>
        </form>

        {/* Footer Buttons */}
        <div className="px-6 py-4 border-t border-gray-700 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 ${
              isSubmitting 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-600 hover:bg-gray-500 text-white'
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || (formData.role === 'employee' && managers.length === 0)}
            className={`px-4 py-2 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 ${
              isSubmitting || (formData.role === 'employee' && managers.length === 0)
                ? 'bg-blue-400 text-white cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              'Create Member'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;