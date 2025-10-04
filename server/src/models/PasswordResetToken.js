// models/PasswordResetToken.js
const mongoose = require('mongoose');
const crypto = require('crypto');

const passwordResetTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expires_at: {
    type: Date,
    required: true
  },
  is_used: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Generate reset token
passwordResetTokenSchema.statics.generateToken = async function(userId) {
  // Generate cryptographically secure token
  const token = crypto.randomBytes(32).toString('hex');
  
  // Set expiration to 1 hour from now
  const expires_at = new Date(Date.now() + 1 * 60 * 60 * 1000);
  
  // Create the token document
  const resetToken = await this.create({
    user: userId,
    token: token,
    expires_at: expires_at
  });

  // Populate user reference for easy access
  await resetToken.populate('user', 'name email');
  
  return resetToken;
};

// Find valid token (not used and not expired)
passwordResetTokenSchema.statics.findValidToken = function(token) {
  return this.findOne({
    token: token,
    is_used: false,
    expires_at: { $gt: new Date() }
  }).populate('user');
};

// Mark token as used
passwordResetTokenSchema.methods.markAsUsed = function() {
  this.is_used = true;
  return this.save();
};

// Check if token is valid
passwordResetTokenSchema.methods.isValid = function() {
  return !this.is_used && this.expires_at > new Date();
};

// Virtual for token status
passwordResetTokenSchema.virtual('status').get(function() {
  if (this.is_used) return 'used';
  if (this.expires_at <= new Date()) return 'expired';
  return 'valid';
});

// Index for automatic expiration cleanup (TTL index)
passwordResetTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

// Index for token queries
passwordResetTokenSchema.index({ token: 1 });
passwordResetTokenSchema.index({ user: 1 });

// Pre-save middleware to ensure unique token
passwordResetTokenSchema.pre('save', async function(next) {
  if (this.isModified('token')) {
    const existingToken = await this.constructor.findOne({ 
      token: this.token,
      _id: { $ne: this._id }
    });
    if (existingToken) {
      const error = new Error('Token already exists');
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('PasswordResetToken', passwordResetTokenSchema);