const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middleware/auth');
const validation = require('../middleware/validation');

router.use(authMiddleware.authenticate);

// Employee routes
router.post('/', validation.validateExpense, expenseController.createExpense);
router.get('/', expenseController.getUserExpenses);
router.get('/:id', expenseController.getExpense);
router.put('/:id', validation.validateExpense, expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);
router.post('/:id/submit', expenseController.submitExpense);

// Receipt OCR
router.post('/receipts/upload', expenseController.uploadReceipt);
router.post('/receipts/ocr', expenseController.processReceiptOCR);

module.exports = router;