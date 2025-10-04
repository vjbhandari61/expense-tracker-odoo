// services/authService.js
const User = require('../models/User');
const Company = require('../models/Company');
const PasswordResetToken = require('../models/PasswordResetToken');

class AuthService {
  // Signup for admin to create their company
  async signup(userData) {
    const { name, email, password, country, currency, companyName } = userData;

    // Check if email already exists globally
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create company
    const company = await Company.create({
      name: companyName || `${name}'s Company`,
      country: country,
      base_currency: currency || 'USD' // Default to USD if not provided
    });

    // Create admin user
    const user = await User.create({
      name,
      email,
      password_hash: password, // Will be hashed by pre-save middleware
      company: company._id,
      role: 'admin'
    });

    // Update company with created_by reference
    company.created_by = user._id;
    await company.save();

    // Return user without password hash
    const userWithoutPassword = await User.findById(user._id)
      .select('-password_hash')
      .populate('company', 'name base_currency country');

    return { 
      user: userWithoutPassword,
      company 
    };
  }

  // Login for any user (admin, manager, employee) from any company
  async login(email, password) {
    const user = await User.findOne({ email, is_active: true })
      .populate('company', 'name base_currency country')
      .populate('manager', 'name email');
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

    return user;
  }

  // Forgot password for any user from any company
    async forgotPassword(email) {
    const user = await User.findOne({ email, is_active: true });
    if (!user) {
      // Don't reveal if user exists for security
      return { 
        success: true,
        message: 'If the email exists, a reset link has been sent' 
      };
    }

    // Invalidate any existing tokens for this user
    await PasswordResetToken.updateMany(
      { user: user._id, is_used: false },
      { is_used: true }
    );

    // Generate new token
    const resetToken = await PasswordResetToken.generateToken(user._id);
    
    // In production, you would send email here with the reset link
    // For now, we'll return the token for testing
    console.log(`Password reset token for ${email}: ${resetToken.token}`);
    console.log(`Reset URL: http://localhost:3000/reset-password?token=${resetToken.token}`);
    
    return {
      success: true,
      message: 'If the email exists, a reset link has been sent',
      // Only return token in development for testing
      ...(process.env.NODE_ENV === 'development' && { 
        token: resetToken.token,
        expires_at: resetToken.expires_at 
      })
    };
  }

  // Reset password for any user
  async resetPassword(token, newPassword) {
    const resetToken = await PasswordResetToken.findValidToken(token);
    
    if (!resetToken) {
      throw new Error('Invalid or expired reset token');
    }

    // Update user password
    const user = resetToken.user;
    user.password_hash = newPassword; // Will be hashed by pre-save middleware
    await user.save();

    // Mark token as used
    await resetToken.markAsUsed();

    return { 
      success: true,
      message: 'Password reset successfully' 
    };
  }

  // Validate reset token (for frontend token verification)
  async validateResetToken(token) {
    const resetToken = await PasswordResetToken.findValidToken(token);
    
    if (!resetToken) {
      throw new Error('Invalid or expired reset token');
    }

    return {
      valid: true,
      email: resetToken.user.email,
      expires_at: resetToken.expires_at
    };
  }
}

module.exports = new AuthService();