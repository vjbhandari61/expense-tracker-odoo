// services/reportService.js
const Expense = require('../models/Expense');
const User = require('../models/User');

class ReportService {
  // Get expense reports with various aggregations
  async getExpenseReports(filters, userRole) {
    try {
      const expenses = await Expense.find(filters)
        .populate('user', 'name email department')
        .populate('company', 'base_currency')
        .sort({ expense_date: -1 });

      // Calculate summary statistics
      const summary = await this.calculateExpenseSummary(filters);
      const categoryBreakdown = await this.getCategoryBreakdown(filters);
      const statusBreakdown = await this.getStatusBreakdown(filters);
      const monthlyTrend = await this.getMonthlyTrend(filters);

      return {
        summary,
        category_breakdown: categoryBreakdown,
        status_breakdown: statusBreakdown,
        monthly_trend: monthlyTrend,
        expenses: expenses.slice(0, 100), // Limit to 100 recent expenses
        total_expenses: expenses.length
      };
    } catch (error) {
      throw new Error(`Failed to generate reports: ${error.message}`);
    }
  }

  // Generate custom report
  async generateReport({ reportType, startDate, endDate, filters, companyId, userId, userRole }) {
    const baseFilters = { company: companyId };

    // Apply user filter for managers
    if (userRole === 'manager') {
      const managedUsers = await this.getManagedUsers(userId);
      baseFilters.user = { $in: managedUsers };
    }

    // Apply date range
    if (startDate || endDate) {
      baseFilters.expense_date = {};
      if (startDate) baseFilters.expense_date.$gte = new Date(startDate);
      if (endDate) baseFilters.expense_date.$lte = new Date(endDate);
    }

    // Apply additional filters
    Object.assign(baseFilters, filters);

    let reportData;

    switch (reportType) {
      case 'expense_summary':
        reportData = await this.generateExpenseSummaryReport(baseFilters);
        break;
      case 'category_analysis':
        reportData = await this.generateCategoryAnalysisReport(baseFilters);
        break;
      case 'user_expenses':
        reportData = await this.generateUserExpensesReport(baseFilters);
        break;
      case 'approval_analysis':
        reportData = await this.generateApprovalAnalysisReport(baseFilters);
        break;
      default:
        throw new Error('Invalid report type');
    }

    return {
      report_type: reportType,
      generated_at: new Date(),
      generated_by: userId,
      date_range: {
        start: startDate,
        end: endDate
      },
      filters: filters,
      ...reportData
    };
  }

  // Generate expense summary report
  async generateExpenseSummaryReport(filters) {
    const summary = await this.calculateExpenseSummary(filters);
    const recentExpenses = await Expense.find(filters)
      .populate('user', 'name email')
      .sort({ expense_date: -1 })
      .limit(50);

    return {
      summary,
      recent_expenses: recentExpenses,
      insights: this.generateInsights(summary)
    };
  }

  // Generate category analysis report
  async generateCategoryAnalysisReport(filters) {
    const categoryBreakdown = await this.getCategoryBreakdown(filters);
    const monthlyCategoryTrend = await this.getMonthlyCategoryTrend(filters);

    return {
      category_breakdown: categoryBreakdown,
      monthly_trend: monthlyCategoryTrend,
      top_categories: categoryBreakdown.slice(0, 5)
    };
  }

  // Generate user expenses report
  async generateUserExpensesReport(filters) {
    const userExpenses = await Expense.aggregate([
      { $match: filters },
      {
        $group: {
          _id: '$user',
          total_amount: { $sum: '$amount_in_base_currency' },
          expense_count: { $sum: 1 },
          average_amount: { $avg: '$amount_in_base_currency' }
        }
      },
      { $sort: { total_amount: -1 } }
    ]);

    // Populate user details
    const userIds = userExpenses.map(item => item._id);
    const users = await User.find({ _id: { $in: userIds } }).select('name email department');

    const userExpensesWithDetails = userExpenses.map(expense => {
      const user = users.find(u => u._id.toString() === expense._id.toString());
      return {
        user: user ? {
          name: user.name,
          email: user.email,
          department: user.department
        } : null,
        total_amount: expense.total_amount,
        expense_count: expense.expense_count,
        average_amount: expense.average_amount
      };
    });

    return {
      user_expenses: userExpensesWithDetails,
      total_users: userExpenses.length
    };
  }

  // Generate approval analysis report
  async generateApprovalAnalysisReport(filters) {
    const statusBreakdown = await this.getStatusBreakdown(filters);
    const approvalTimeline = await this.getApprovalTimeline(filters);

    return {
      status_breakdown: statusBreakdown,
      approval_timeline: approvalTimeline,
      approval_rate: this.calculateApprovalRate(statusBreakdown)
    };
  }

  // Calculate expense summary statistics
  async calculateExpenseSummary(filters) {
    const result = await Expense.aggregate([
      { $match: filters },
      {
        $group: {
          _id: null,
          total_amount: { $sum: '$amount_in_base_currency' },
          average_amount: { $avg: '$amount_in_base_currency' },
          min_amount: { $min: '$amount_in_base_currency' },
          max_amount: { $max: '$amount_in_base_currency' },
          expense_count: { $sum: 1 }
        }
      }
    ]);

    return result[0] || {
      total_amount: 0,
      average_amount: 0,
      min_amount: 0,
      max_amount: 0,
      expense_count: 0
    };
  }

  // Get category breakdown
  async getCategoryBreakdown(filters) {
    return await Expense.aggregate([
      { $match: filters },
      {
        $group: {
          _id: '$category',
          total_amount: { $sum: '$amount_in_base_currency' },
          expense_count: { $sum: 1 },
          average_amount: { $avg: '$amount_in_base_currency' }
        }
      },
      { $sort: { total_amount: -1 } }
    ]);
  }

  // Get status breakdown
  async getStatusBreakdown(filters) {
    return await Expense.aggregate([
      { $match: filters },
      {
        $group: {
          _id: '$status',
          total_amount: { $sum: '$amount_in_base_currency' },
          expense_count: { $sum: 1 }
        }
      },
      { $sort: { expense_count: -1 } }
    ]);
  }

  // Get monthly trend
  async getMonthlyTrend(filters) {
    return await Expense.aggregate([
      { $match: filters },
      {
        $group: {
          _id: {
            year: { $year: '$expense_date' },
            month: { $month: '$expense_date' }
          },
          total_amount: { $sum: '$amount_in_base_currency' },
          expense_count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
  }

  // Get monthly category trend
  async getMonthlyCategoryTrend(filters) {
    return await Expense.aggregate([
      { $match: filters },
      {
        $group: {
          _id: {
            year: { $year: '$expense_date' },
            month: { $month: '$expense_date' },
            category: '$category'
          },
          total_amount: { $sum: '$amount_in_base_currency' },
          expense_count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
  }

  // Get approval timeline
  async getApprovalTimeline(filters) {
    return await Expense.aggregate([
      { 
        $match: { 
          ...filters,
          status: { $in: ['approved', 'rejected'] }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$approved_at' },
            month: { $month: '$approved_at' }
          },
          approved_count: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejected_count: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
  }

  // Calculate approval rate
  calculateApprovalRate(statusBreakdown) {
    const approved = statusBreakdown.find(s => s._id === 'approved');
    const rejected = statusBreakdown.find(s => s._id === 'rejected');
    
    const totalDecided = (approved?.expense_count || 0) + (rejected?.expense_count || 0);
    
    if (totalDecided === 0) return 0;
    
    return ((approved?.expense_count || 0) / totalDecided) * 100;
  }

  // Generate insights from summary data
  generateInsights(summary) {
    const insights = [];

    if (summary.average_amount > 1000) {
      insights.push('High average expense amount detected');
    }

    if (summary.expense_count > 100) {
      insights.push('Large number of expenses in this period');
    }

    if (summary.max_amount > 5000) {
      insights.push('Very high individual expenses present');
    }

    return insights.length > 0 ? insights : ['Normal expense patterns detected'];
  }

  // Get users managed by a manager
  async getManagedUsers(managerId) {
    const managedUsers = await User.find({ 
      manager: managerId,
      is_active: true 
    }).select('_id');
    
    return managedUsers.map(user => user._id.toString());
  }
}

module.exports = new ReportService();