// services/approvalService.js
const Expense = require('../models/Expense');
const User = require('../models/User');

class ApprovalService {
  // Get pending approvals for manager
  async getPendingApprovals(managerId, companyId, userRole, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    let filters = { 
      company: companyId,
      status: 'pending_approval'
    };

    // For managers, only show expenses from their team
    if (userRole === 'manager') {
      const managedUsers = await this.getManagedUsers(managerId);
      filters.user = { $in: managedUsers };
    }
    // Admin can see all pending approvals in the company

    const [expenses, total] = await Promise.all([
      Expense.find(filters)
        .populate('user', 'name email')
        .populate('receipt')
        .populate('company', 'base_currency')
        .sort({ submitted_at: 1 }) // Oldest first
        .skip(skip)
        .limit(limit),
      Expense.countDocuments(filters)
    ]);

    return {
      expenses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Approve expense
  async approveExpense(expenseId, managerId, companyId, userRole, notes = '') {
    const expense = await Expense.findOne({ _id: expenseId, company: companyId })
      .populate('user', 'name email manager')
      .populate('receipt')
      .populate('company', 'base_currency');

    if (!expense) {
      throw new Error('Expense not found');
    }

    // Check if expense is pending approval
    if (expense.status !== 'pending_approval') {
      throw new Error('Expense is not pending approval');
    }

    // Authorization check
    if (userRole === 'manager') {
      const managedUsers = await this.getManagedUsers(managerId);
      if (!managedUsers.includes(expense.user._id.toString())) {
        throw new Error('Access denied. You can only approve expenses from your team.');
      }
    }

    // Check if manager approval is required first
    if (expense.user.manager && expense.user.is_manager_approver) {
      const userManager = await User.findById(expense.user.manager);
      if (userManager && userManager._id.toString() !== managerId.toString()) {
        throw new Error('This expense requires approval from the employee\'s direct manager first.');
      }
    }

    // Update expense status
    expense.status = 'approved';
    expense.approved_at = new Date();
    expense.approval_notes = notes;
    expense.current_approver = managerId;

    await expense.save();

    // TODO: Send notification to employee about approval
    console.log(`Expense ${expenseId} approved by manager ${managerId}`);

    return await Expense.findById(expense._id)
      .populate('user', 'name email')
      .populate('receipt')
      .populate('company', 'base_currency');
  }

  // Reject expense
  async rejectExpense(expenseId, managerId, companyId, userRole, reason = '') {
    const expense = await Expense.findOne({ _id: expenseId, company: companyId })
      .populate('user', 'name email manager')
      .populate('receipt')
      .populate('company', 'base_currency');

    if (!expense) {
      throw new Error('Expense not found');
    }

    // Check if expense is pending approval
    if (expense.status !== 'pending_approval') {
      throw new Error('Expense is not pending approval');
    }

    // Authorization check
    if (userRole === 'manager') {
      const managedUsers = await this.getManagedUsers(managerId);
      if (!managedUsers.includes(expense.user._id.toString())) {
        throw new Error('Access denied. You can only reject expenses from your team.');
      }
    }

    // Check if manager approval is required first
    if (expense.user.manager && expense.user.is_manager_approver) {
      const userManager = await User.findById(expense.user.manager);
      if (userManager && userManager._id.toString() !== managerId.toString()) {
        throw new Error('This expense requires approval from the employee\'s direct manager first.');
      }
    }

    if (!reason || reason.trim().length === 0) {
      throw new Error('Rejection reason is required');
    }

    // Update expense status
    expense.status = 'rejected';
    expense.rejected_at = new Date();
    expense.rejection_reason = reason;
    expense.current_approver = managerId;

    await expense.save();

    // TODO: Send notification to employee about rejection
    console.log(`Expense ${expenseId} rejected by manager ${managerId}. Reason: ${reason}`);

    return await Expense.findById(expense._id)
      .populate('user', 'name email')
      .populate('receipt')
      .populate('company', 'base_currency');
  }

  // Get users managed by a manager
  async getManagedUsers(managerId) {
    const managedUsers = await User.find({ 
      manager: managerId,
      is_active: true 
    }).select('_id');
    
    return managedUsers.map(user => user._id.toString());
  }

  // Get approval statistics
  async getApprovalStats(managerId, companyId) {
    const managedUsers = await this.getManagedUsers(managerId);
    
    const stats = await Expense.aggregate([
      {
        $match: {
          company: companyId,
          user: { $in: managedUsers }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount_in_base_currency' }
        }
      }
    ]);

    return stats;
  }
}

module.exports = new ApprovalService();