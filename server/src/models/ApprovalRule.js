// models/ApprovalRule.js
const mongoose = require('mongoose');

const approvalRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  // Minimum amount to trigger this rule
  min_amount: {
    type: Number,
    required: true,
    min: 0
  },
  // Sequential approvers (Manager → Admin → etc.)
  sequential_approvers: [{
    level: {
      type: Number,
      required: true,
      min: 1
    },
    approver_type: {
      type: String,
      enum: ['manager', 'admin', 'specific_user'],
      required: true
    },
    approver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    is_required: {
      type: Boolean,
      default: true
    }
  }],
  // Conditional approval settings
  conditional_approval: {
    enabled: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['percentage', 'specific_approver', 'hybrid']
    },
    approval_percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 60
    },
    specific_approvers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    auto_approve_if_specific_approves: {
      type: Boolean,
      default: false
    }
  },
  // Manager first approval requirement
  requires_manager_approval_first: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 1
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
approvalRuleSchema.index({ company: 1, is_active: 1, priority: -1 });
approvalRuleSchema.index({ min_amount: 1 });

module.exports = mongoose.model('ApprovalRule', approvalRuleSchema);