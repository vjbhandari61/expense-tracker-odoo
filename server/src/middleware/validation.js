// middleware/validation.js
const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Auth validation
const validateSignup = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('country').notEmpty().withMessage('Country is required'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('companyName').optional().trim().isLength({ min: 2 }).withMessage('Company name must be at least 2 characters'),
  handleValidationErrors
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

// User management validation
const validateCreateUser = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('role').isIn(['employee', 'manager']).withMessage('Role must be employee or manager'),
  body('manager').optional().isMongoId().withMessage('Manager must be a valid user ID'),
  handleValidationErrors
];

const validateUpdateUser = [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('role').optional().isIn(['employee', 'manager']).withMessage('Role must be employee or manager'),
  body('manager').optional().isMongoId().withMessage('Manager must be a valid user ID'),
  handleValidationErrors
];

const validateExpense = [
  body('title').trim().isLength({ min: 2 }).withMessage('Title must be at least 2 characters'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('currency').isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('category').isIn(['travel', 'meals', 'equipment', 'office_supplies', 'other']).withMessage('Invalid category'),
  body('expense_date').isISO8601().withMessage('Valid expense date is required'),
  body('description').optional().trim(),
  body('receipt').optional().isMongoId().withMessage('Receipt must be a valid ID'),
  handleValidationErrors
];

const validateApprovalRule = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('min_amount').isFloat({ min: 0 }).withMessage('Minimum amount must be a positive number'),
  body('sequential_approvers').isArray({ min: 1 }).withMessage('At least one approver is required'),
  body('sequential_approvers.*.level').isInt({ min: 1 }).withMessage('Level must be a positive integer'),
  body('sequential_approvers.*.approver_type').isIn(['manager', 'admin', 'specific_user']).withMessage('Invalid approver type'),
  body('sequential_approvers.*.approver_id').optional().isMongoId().withMessage('Invalid approver ID'),
  body('conditional_approval.enabled').optional().isBoolean(),
  body('conditional_approval.type').optional().isIn(['percentage', 'specific_approver', 'hybrid']),
  body('conditional_approval.approval_percentage').optional().isInt({ min: 0, max: 100 }),
  body('conditional_approval.specific_approvers').optional().isArray(),
  body('conditional_approval.auto_approve_if_specific_approves').optional().isBoolean(),
  body('requires_manager_approval_first').optional().isBoolean(),
  body('priority').optional().isInt({ min: 1 }),
  handleValidationErrors
];



module.exports = {
  validateSignup,
  validateLogin,
  validateCreateUser,
  validateUpdateUser,
  validateExpense,
  validateApprovalRule
};