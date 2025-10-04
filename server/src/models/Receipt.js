// models/Receipt.js
const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
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
  filename: {
    type: String,
    required: true
  },
  original_filename: {
    type: String,
    required: true
  },
  file_path: {
    type: String,
    required: true
  },
  file_size: {
    type: Number,
    required: true
  },
  mime_type: {
    type: String,
    required: true
  },
  ocr_data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  is_processed: {
    type: Boolean,
    default: false
  },
  processed_at: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

receiptSchema.index({ user: 1, created_at: -1 });
receiptSchema.index({ company: 1 });

module.exports = mongoose.model('Receipt', receiptSchema);