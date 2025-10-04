// controllers/expenseController.js
const expenseService = require('../services/expenseService');

exports.createExpense = async (req, res) => {
  try {
    const userId = req.user._id;
    const companyId = req.user.company._id;
    const expenseData = req.body;

    const expense = await expenseService.createExpense(expenseData, userId, companyId);

    res.status(201).json({
      success: true,
      message: 'Expense created and submitted for approval',
      data: expense
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


exports.getUserExpenses = async (req, res) => {
  try {
    const userId = req.user._id;
    const companyId = req.user.company._id;
    const userRole = req.user.role;
    
    const { 
      page = 1, 
      limit = 10, 
      status, 
      category, 
      startDate, 
      endDate 
    } = req.query;

    const filters = { company: companyId };
    
    // Role-based filtering
    if (userRole === 'employee') {
      filters.user = userId;
    } else if (userRole === 'manager') {
      // Managers can see their team's expenses
      const managedUsers = await expenseService.getManagedUsers(userId);
      filters.user = { $in: managedUsers };
    }
    // Admin can see all expenses in company

    if (status) filters.status = status;
    if (category) filters.category = category;
    if (startDate || endDate) {
      filters.expense_date = {};
      if (startDate) filters.expense_date.$gte = new Date(startDate);
      if (endDate) filters.expense_date.$lte = new Date(endDate);
    }

    const result = await expenseService.getExpenses(
      parseInt(page),
      parseInt(limit),
      filters
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getExpense = async (req, res) => {
  try {
    const expenseId = req.params.id;
    const userId = req.user._id;
    const companyId = req.user.company._id;
    const userRole = req.user.role;

    const expense = await expenseService.getExpenseById(expenseId, userId, companyId, userRole);

    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const expenseId = req.params.id;
    const userId = req.user._id;
    const companyId = req.user.company._id;
    const updateData = req.body;

    const expense = await expenseService.updateExpense(expenseId, userId, companyId, updateData);

    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: expense
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expenseId = req.params.id;
    const userId = req.user._id;
    const companyId = req.user.company._id;

    await expenseService.deleteExpense(expenseId, userId, companyId);

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.submitExpense = async (req, res) => {
  try {
    const expenseId = req.params.id;
    const userId = req.user._id;
    const companyId = req.user.company._id;

    const expense = await expenseService.submitExpense(expenseId, userId, companyId);

    res.json({
      success: true,
      message: 'Expense submitted for approval',
      data: expense
    });
  } catch (error) {
    console.error('Submit expense error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.uploadReceipt = async (req, res) => {
  try {
    const userId = req.user._id;
    const companyId = req.user.company._id;
    const file = req.file; // Assuming you're using multer for file uploads

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const receipt = await expenseService.uploadReceipt(file, userId, companyId);

    res.json({
      success: true,
      message: 'Receipt uploaded successfully',
      data: receipt
    });
  } catch (error) {
    console.error('Upload receipt error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.processReceiptOCR = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const userId = req.user._id;
    const companyId = req.user.company._id;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'imageUrl is required'
      });
    }

    const result = await expenseService.processReceiptOCR(imageUrl, userId, companyId);

    res.json({
      success: true,
      message: 'OCR processing completed',
      data: result
    });
  } catch (error) {
    console.error('OCR processing error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};