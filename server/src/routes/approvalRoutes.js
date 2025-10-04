// routes/approvalRoutes.js
const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware.authenticate);

// Manager routes
router.get('/pending', approvalController.getPendingApprovals);
router.put('/:id/approve', approvalController.approveExpense);
router.put('/:id/reject', approvalController.rejectExpense);

module.exports = router;