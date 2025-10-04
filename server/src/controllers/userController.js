// controllers/userController.js
const userService = require('../services/userService');

exports.getUsers = async (req, res) => {
  try {
    const companyId = req.user.company._id;
    const { page = 1, limit = 10, role, search } = req.query;
    
    const filters = {};
    if (role) filters.role = role;
    if (search) {
      filters.name = { $regex: search, $options: 'i' };
    }

    const result = await userService.getCompanyUsers(
      companyId, 
      parseInt(page), 
      parseInt(limit), 
      filters
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.createUser = async (req, res) => {
  try {
    const companyId = req.user.company._id;
    const createdByUserId = req.user._id;
    const { name, email, role, manager } = req.body;

    const user = await userService.createUser(
      { name, email, role, manager },
      companyId,
      createdByUserId
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const companyId = req.user.company._id;
    const userId = req.params.id;

    const user = await userService.getUserById(userId, companyId);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const companyId = req.user.company._id;
    const userId = req.params.id;
    const updateData = req.body;

    const user = await userService.updateUser(userId, companyId, updateData);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const companyId = req.user.company._id;
    const userId = req.params.id;

    const result = await userService.deleteUser(userId, companyId);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getManagers = async (req, res) => {
  try {
    const companyId = req.user.company._id;

    const managers = await userService.getCompanyManagers(companyId);

    res.json({
      success: true,
      data: managers
    });
  } catch (error) {
    console.error('Get managers error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};