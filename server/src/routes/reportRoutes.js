const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware.authenticate);

// Admin/Manager routes
router.get('/expenses', reportController.getExpenseReports);
router.post('/generate', reportController.generateReport);

module.exports = router;