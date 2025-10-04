// routes/approvalRuleRoutes.js
const express = require('express');
const router = express.Router();
const approvalRuleController = require('../controllers/approvalRuleController');
const authMiddleware = require('../middleware/auth');
const validation = require('../middleware/validation');

router.use(authMiddleware.authenticate);
router.use(authMiddleware.authorize('admin')); // Admin only

router.post('/', validation.validateApprovalRule, approvalRuleController.createRule);
router.get('/', approvalRuleController.getRules);
router.get('/available-approvers', approvalRuleController.getAvailableApprovers);
router.get('/:id', approvalRuleController.getRule);
router.put('/:id', validation.validateApprovalRule, approvalRuleController.updateRule);
router.delete('/:id', approvalRuleController.deleteRule);

module.exports = router;