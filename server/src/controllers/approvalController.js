// controllers/approvalController.js
const approvalService = require('../services/approvalService');

exports.getPendingApprovals = async (req, res) => {
  try {
    const managerId = req.user._id;
    const companyId = req.user.company._id;
    const userRole = req.user.role;

    // Only managers and admins can access approvals
    if (userRole !== 'manager' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only managers and admins can view approvals.'
      });
    }

    const { page = 1, limit = 10 } = req.query;

    const result = await approvalService.getPendingApprovals(
      managerId,
      companyId,
      userRole,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.approveExpense = async (req, res) => {
  try {
    const managerId = req.user._id;
    const companyId = req.user.company._id;
    const userRole = req.user.role;
    const expenseId = req.params.id;
    const { notes } = req.body;

    // Only managers and admins can approve expenses
    if (userRole !== 'manager' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only managers and admins can approve expenses.'
      });
    }

    const expense = await approvalService.approveExpense(
      expenseId,
      managerId,
      companyId,
      userRole,
      notes
    );

    res.json({
      success: true,
      message: 'Expense approved successfully',
      data: expense
    });
  } catch (error) {
    console.error('Approve expense error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.rejectExpense = async (req, res) => {
  try {
    const managerId = req.user._id;
    const companyId = req.user.company._id;
    const userRole = req.user.role;
    const expenseId = req.params.id;
    const { reason } = req.body;

    // Only managers and admins can reject expenses
    if (userRole !== 'manager' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only managers and admins can reject expenses.'
      });
    }

    const expense = await approvalService.rejectExpense(
      expenseId,
      managerId,
      companyId,
      userRole,
      reason
    );

    res.json({
      success: true,
      message: 'Expense rejected successfully',
      data: expense
    });
  } catch (error) {
    console.error('Reject expense error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};