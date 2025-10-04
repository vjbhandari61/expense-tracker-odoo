const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const validation = require('../middleware/validation');

router.use(authMiddleware.authenticate);

// User management (Admin only in their company)
router.get('/', userController.getUsers);
router.post('/', validation.validateCreateUser, userController.createUser);
router.get('/managers', userController.getManagers);
router.get('/:id', userController.getUser);
router.put('/:id', validation.validateUpdateUser, userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;