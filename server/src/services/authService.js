const User = require('../models/User');
const Company = require('../models/Company');
const PasswordResetToken = require('../models/PasswordResetToken');
const currencyService = require('./currencyService');

class AuthService {
  async signup(userData, country) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const countries = await currencyService.getCountriesWithCurrencies();
    const countryData = countries.find(c => 
      c.name.common.toLowerCase() === country.toLowerCase()
    );
    
    if (!countryData) {
      throw new Error('Country not found');
    }

    const baseCurrency = Object.keys(countryData.currencies)[0];

    const company = await Company.create({
      name: `${userData.name}'s Company`,
      country: country,
      base_currency: baseCurrency
    });

    const user = await User.create({
      ...userData,
      company: company._id,
      role: 'admin'
    });

    company.created_by = user._id;
    await company.save();

    return { 
      user: await User.findById(user._id).select('-password_hash'),
      company 
    };
  }

  async login(email, password) {
    const user = await User.findOne({ email, is_active: true })
      .populate('company', 'name base_currency')
      .populate('manager', 'name email');
    
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid email or password');
    }

    user.last_login = new Date();
    await user.save();

    return user;
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email, is_active: true });
    if (!user) {
      return { 
        success: true,
        message: 'If the email exists, a reset link has been sent' 
      };
    }

    const resetToken = await PasswordResetToken.generateToken(user._id);
    
    // In production, you would send email here
    console.log(`Password reset token for ${email}: ${resetToken.token}`);
    
    return {
      success: true,
      message: 'If the email exists, a reset link has been sent',
      // Only return token in development for testing
      ...(process.env.NODE_ENV === 'development' && { token: resetToken.token })
    };
  }

  async resetPassword(token, newPassword) {
    const resetToken = await PasswordResetToken.findValidToken(token);
    if (!resetToken) {
      throw new Error('Invalid or expired reset token');
    }

    resetToken.user.password_hash = newPassword;
    await resetToken.user.save();

    resetToken.is_used = true;
    await resetToken.save();

    return { 
      success: true,
      message: 'Password reset successfully' 
    };
  }

  async canCreateUsers(userId, companyId) {
    const user = await User.findOne({ _id: userId, company: companyId });
    return user && user.role === 'admin';
  }
}

module.exports = new AuthService();