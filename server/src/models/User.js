const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password_hash: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['employee', 'manager', 'admin'],
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  is_manager_approver: {
    type: Boolean,
    default: false
  },
  is_active: {
    type: Boolean,
    default: true
  },
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password_hash')) return next();
  this.password_hash = await bcrypt.hash(this.password_hash, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password_hash);
};

userSchema.path('manager').validate(function(value) {
  if (!value) return true; 
  if (!this._id) return true;
  
  return value.toString() !== this._id.toString();
}, 'User cannot be their own manager');

userSchema.index({ email: 1 });
userSchema.index({ company: 1, role: 1 });
userSchema.index({ manager: 1 });

module.exports = mongoose.model('User', userSchema);