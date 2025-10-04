import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signupAdmin } from '../../util/requester';

const SignupPage = () => {
  const navigate = useNavigate();
  const [countries, setCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    password: '',
    confirmPassword: '',
    country: '',
    currency: ''
  });

  // Fetch countries from API
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies');
        if (!response.ok) {
          throw new Error('Failed to fetch countries');
        }
        const data = await response.json();
        // Sort countries alphabetically by common name
        const sortedCountries = data
          .map(country => ({
            name: country.name.common,
            officialName: country.name.official,
            currency: country.currencies ? Object.keys(country.currencies)[0] : ''
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCountries(sortedCountries);
      } catch (err) {
        console.error('Error fetching countries:', err);
        setError('Failed to load countries. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const handleChange = (e) => {
    if (e.target.name === 'country') {
      const selectedCountry = countries.find(c => c.name === e.target.value);
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
        currency: selectedCountry?.currency || ''
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        country: formData.country,
        currency: formData.currency,
        companyName: formData.companyName
      };
      const result = await signupAdmin(payload);
      console.log('Signup success:', result);
      alert("Signup successful! Please login.");
      navigate('/login');
    } catch (err) {
      console.error('Signup error:', err);
      alert("Signup failed. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto mb-8"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-700 rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-center">
          <div className="text-red-400 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400 text-sm sm:text-base">Join us today</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm sm:text-base"
                placeholder="Enter your full name"
              />
            </div>

            {/* Company Name Field */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-300 mb-2">
                Company Name
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                required
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm sm:text-base"
                placeholder="Enter your company name"
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm sm:text-base"
                placeholder="Enter your email"
              />
            </div>

            {/* Country and Currency */}
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-2">
                    Country
                  </label>
                  <div className="relative">
                    <select
                      id="country"
                      name="country"
                      required
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 appearance-none cursor-pointer text-sm sm:text-base"
                    >
                      <option value="" className="text-gray-400">Select your country</option>
                      {countries.map((country) => (
                        <option key={country.name} value={country.name} className="bg-gray-700 text-white">
                          {country.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Currency Display */}
                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-300 mb-2">
                    Currency
                  </label>
                  <input
                    id="currency"
                    type="text"
                    disabled
                    value={formData.currency || ''}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white cursor-not-allowed opacity-75"
                    placeholder="Select a country"
                  />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm sm:text-base"
                placeholder="Create a password"
              />
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm sm:text-base"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          {/* Sign Up Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 sm:py-3 px-4 rounded-lg transition duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 text-sm sm:text-base"
            >
              Create Account
            </button>
          </div>
        </form>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm sm:text-base">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-400 hover:text-blue-300 font-semibold transition duration-200 focus:outline-none"
            >
              Login
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default SignupPage;
