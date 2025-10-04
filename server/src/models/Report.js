// models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['expense_summary', 'category_analysis', 'user_expenses', 'approval_analysis'],
    required: true
  },
  generated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  date_range_start: {
    type: Date,
    required: true
  },
  date_range_end: {
    type: Date,
    required: true
  },
  filters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  file_path: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

reportSchema.index({ generated_by: 1, created_at: -1 });
reportSchema.index({ company: 1, type: 1 });

module.exports = mongoose.model('Report', reportSchema);