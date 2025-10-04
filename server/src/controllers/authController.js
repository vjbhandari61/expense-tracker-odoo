// controllers/authController.js
const authService = require('../services/authService');
const { generateToken } = require('../utils/jwt');

exports.signup = async (req, res) => {
  try {
    const { name, email, password, country, currency, companyName } = req.body;
    
    const result = await authService.signup({
      name,
      email,
      password,
      country,
      currency,
      companyName
    });

    // Generate JWT token
    const token = generateToken(result.user._id);

    res.status(201).json({
      success: true,
      message: 'Company and admin user created successfully',
      data: {
        user: {
          id: result.user._id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role
        },
        company: result.company,
        token
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await authService.login(email, password);
    
    // Generate JWT token
    const token = generateToken(user._id);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const result = await authService.forgotPassword(email);
    
    res.json(result);
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const result = await authService.resetPassword(token, newPassword);
    
    res.json(result);
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.validateResetToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    const result = await authService.validateResetToken(token);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};