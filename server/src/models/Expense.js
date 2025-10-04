// models/Expense.js
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  currency: {
    type: String,
    required: true,
    uppercase: true,
    length: 3
  },
  amount_in_base_currency: {
    type: Number,
    required: true,
    min: 0.01
  },
  category: {
    type: String,
    required: true,
    enum: ['travel', 'meals', 'equipment', 'office_supplies', 'other']
  },
  expense_date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'pending_approval', 'approved', 'rejected', 'paid'],
    default: 'draft'
  },
  receipt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Receipt',
    default: null
  },
  ocr_extracted_data: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  submitted_at: {
    type: Date,
    default: null
  },
    approved_at: {
    type: Date,
    default: null
  },
  rejected_at: {
    type: Date,
    default: null
  },
  paid_at: {
    type: Date,
    default: null
  },
  rejection_reason: {
    type: String,
    trim: true,
    maxlength: 500,
    default: null
  },
  approval_notes: {
    type: String,
    trim: true,
    maxlength: 500,
    default: null
  },
  current_approver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Indexes for queries
expenseSchema.index({ user: 1, status: 1 });
expenseSchema.index({ company: 1, status: 1 });
expenseSchema.index({ status: 1, submitted_at: -1 });

module.exports = mongoose.model('Expense', expenseSchema);