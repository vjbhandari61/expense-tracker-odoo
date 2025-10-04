// api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTHENTICATION APIs ====================

export const signupAdmin = async (adminData) => {
  try {
    const response = await api.post("/auth/signup", adminData);
    console.log("Signup success:", response.data);
    return response.data;
  } catch (error) {
    console.error("Signup failed:", error.response?.data || error.message);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post("/auth/login", credentials);
    console.log("Login success:", response.data);
    
    // Store token in localStorage
    if (response.data.data?.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    throw error;
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  } catch (error) {
    console.error("Forgot password failed:", error.response?.data || error.message);
    throw error;
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post("/auth/reset-password", { token, newPassword });
    return response.data;
  } catch (error) {
    console.error("Reset password failed:", error.response?.data || error.message);
    throw error;
  }
};

export const validateResetToken = async (token) => {
  try {
    const response = await api.post("/auth/validate-reset-token", { token });
    return response.data;
  } catch (error) {
    console.error("Validate token failed:", error.response?.data || error.message);
    throw error;
  }
};

// ==================== USER MANAGEMENT APIs ====================

export const getUsers = async (params = {}) => {
  try {
    const response = await api.get("/users", { params });
    return response.data;
  } catch (error) {
    console.error("Get users failed:", error.response?.data || error.message);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await api.post("/users", userData);
    return response.data;
  } catch (error) {
    console.error("Create user failed:", error.response?.data || error.message);
    throw error;
  }
};

export const getUser = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Get user failed:", error.response?.data || error.message);
    throw error;
  }
};

export const updateUser = async (userId, updateData) => {
  try {
    const response = await api.put(`/users/${userId}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Update user failed:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Delete user failed:", error.response?.data || error.message);
    throw error;
  }
};

export const getManagers = async () => {
  try {
    const response = await api.get("/users/managers");
    return response.data;
  } catch (error) {
    console.error("Get managers failed:", error.response?.data || error.message);
    throw error;
  }
};

// ==================== EXPENSE APIs ====================

export const createExpense = async (expenseData) => {
  try {
    const response = await api.post("/expenses", expenseData);
    return response.data;
  } catch (error) {
    console.error("Create expense failed:", error.response?.data || error.message);
    throw error;
  }
};

export const getUserExpenses = async (params = {}) => {
  try {
    const response = await api.get("/expenses", { params });
    return response.data;
  } catch (error) {
    console.error("Get expenses failed:", error.response?.data || error.message);
    throw error;
  }
};

export const getExpense = async (expenseId) => {
  try {
    const response = await api.get(`/expenses/${expenseId}`);
    return response.data;
  } catch (error) {
    console.error("Get expense failed:", error.response?.data || error.message);
    throw error;
  }
};

export const updateExpense = async (expenseId, updateData) => {
  try {
    const response = await api.put(`/expenses/${expenseId}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Update expense failed:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteExpense = async (expenseId) => {
  try {
    const response = await api.delete(`/expenses/${expenseId}`);
    return response.data;
  } catch (error) {
    console.error("Delete expense failed:", error.response?.data || error.message);
    throw error;
  }
};

export const processReceiptOCR = async (imageUrl) => {
  try {
    const response = await api.post("/expenses/receipts/ocr", { imageUrl });
    return response.data;
  } catch (error) {
    console.error("OCR processing failed:", error.response?.data || error.message);
    throw error;
  }
};

// ==================== APPROVAL APIs ====================

export const getPendingApprovals = async (params = {}) => {
  try {
    const response = await api.get("/approvals/pending", { params });
    return response.data;
  } catch (error) {
    console.error("Get pending approvals failed:", error.response?.data || error.message);
    throw error;
  }
};

export const approveExpense = async (expenseId, notes = "") => {
  try {
    const response = await api.put(`/approvals/${expenseId}/approve`, { notes });
    return response.data;
  } catch (error) {
    console.error("Approve expense failed:", error.response?.data || error.message);
    throw error;
  }
};

export const rejectExpense = async (expenseId, reason) => {
  try {
    const response = await api.put(`/approvals/${expenseId}/reject`, { reason });
    return response.data;
  } catch (error) {
    console.error("Reject expense failed:", error.response?.data || error.message);
    throw error;
  }
};

// ==================== APPROVAL RULE APIs ====================

export const getApprovalRules = async (params = {}) => {
  try {
    const response = await api.get("/approval-rules", { params });
    return response.data;
  } catch (error) {
    console.error("Get approval rules failed:", error.response?.data || error.message);
    throw error;
  }
};

export const createApprovalRule = async (ruleData) => {
  try {
    const response = await api.post("/approval-rules", ruleData);
    return response.data;
  } catch (error) {
    console.error("Create approval rule failed:", error.response?.data || error.message);
    throw error;
  }
};

export const getApprovalRule = async (ruleId) => {
  try {
    const response = await api.get(`/approval-rules/${ruleId}`);
    return response.data;
  } catch (error) {
    console.error("Get approval rule failed:", error.response?.data || error.message);
    throw error;
  }
};

export const updateApprovalRule = async (ruleId, updateData) => {
  try {
    const response = await api.put(`/approval-rules/${ruleId}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Update approval rule failed:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteApprovalRule = async (ruleId) => {
  try {
    const response = await api.delete(`/approval-rules/${ruleId}`);
    return response.data;
  } catch (error) {
    console.error("Delete approval rule failed:", error.response?.data || error.message);
    throw error;
  }
};

export const getAvailableApprovers = async () => {
  try {
    const response = await api.get("/approval-rules/available-approvers");
    return response.data;
  } catch (error) {
    console.error("Get available approvers failed:", error.response?.data || error.message);
    throw error;
  }
};

// ==================== REPORT APIs ====================

export const getExpenseReports = async (params = {}) => {
  try {
    const response = await api.get("/reports/expenses", { params });
    return response.data;
  } catch (error) {
    console.error("Get expense reports failed:", error.response?.data || error.message);
    throw error;
  }
};

export const generateReport = async (reportData) => {
  try {
    const response = await api.post("/reports/generate", reportData);
    return response.data;
  } catch (error) {
    console.error("Generate report failed:", error.response?.data || error.message);
    throw error;
  }
};

// ==================== MISC APIs ====================

export const getCurrencies = async () => {
  try {
    const response = await api.get("/misc/currencies");
    return response.data;
  } catch (error) {
    console.error("Get currencies failed:", error.response?.data || error.message);
    throw error;
  }
};

export const getCountries = async () => {
  try {
    const response = await api.get("/misc/countries");
    return response.data;
  } catch (error) {
    console.error("Get countries failed:", error.response?.data || error.message);
    throw error;
  }
};

// ==================== HEALTH CHECK ====================

export const healthCheck = async () => {
  try {
    const response = await api.get("/health");
    return response.data;
  } catch (error) {
    console.error("Health check failed:", error.response?.data || error.message);
    throw error;
  }
};

// ==================== UTILITY FUNCTIONS ====================

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const logout = () => {
  localStorage.removeItem('token');
  delete api.defaults.headers.common['Authorization'];
};

export default api;