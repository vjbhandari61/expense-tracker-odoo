// controllers/reportController.js
const reportService = require('../services/reportService');

exports.getExpenseReports = async (req, res) => {
  try {
    const userId = req.user._id;
    const companyId = req.user.company._id;
    const userRole = req.user.role;
    
    const { 
      startDate, 
      endDate, 
      category, 
      status,
      userId: filterUserId 
    } = req.query;

    // Only admin and manager can access reports
    if (userRole !== 'admin' && userRole !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins and managers can view reports.'
      });
    }

    const filters = {
      company: companyId
    };

    // Apply user filter based on role
    if (userRole === 'manager') {
      const managedUsers = await reportService.getManagedUsers(userId);
      filters.user = { $in: managedUsers };
    } else if (filterUserId && userRole === 'admin') {
      // Admin can filter by specific user
      filters.user = filterUserId;
    }

    if (startDate || endDate) {
      filters.expense_date = {};
      if (startDate) filters.expense_date.$gte = new Date(startDate);
      if (endDate) filters.expense_date.$lte = new Date(endDate);
    }

    if (category) filters.category = category;
    if (status) filters.status = status;

    const reports = await reportService.getExpenseReports(filters, userRole);

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Get expense reports error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.generateReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const companyId = req.user.company._id;
    const userRole = req.user.role;
    const { reportType, startDate, endDate, filters = {} } = req.body;

    // Only admin and manager can generate reports
    if (userRole !== 'admin' && userRole !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins and managers can generate reports.'
      });
    }

    const report = await reportService.generateReport({
      reportType,
      startDate,
      endDate,
      filters,
      companyId,
      userId,
      userRole
    });

    res.json({
      success: true,
      message: 'Report generated successfully',
      data: report
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};