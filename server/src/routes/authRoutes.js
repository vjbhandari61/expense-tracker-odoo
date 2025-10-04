// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validation = require('../middleware/validation');

// Public routes - same for everyone
router.post('/signup', validation.validateSignup, authController.signup);
router.post('/login', validation.validateLogin, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/validate-reset-token', authController.validateResetToken);
router.post('/reset-password', authController.resetPassword);

module.exports = router;