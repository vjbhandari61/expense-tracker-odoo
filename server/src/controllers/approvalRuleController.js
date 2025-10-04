// controllers/approvalRuleController.js
const approvalRuleService = require('../services/approvalRuleService');

exports.createRule = async (req, res) => {
  try {
    const companyId = req.user.company._id;
    const createdBy = req.user._id;
    const ruleData = req.body;

    const rule = await approvalRuleService.createRule(ruleData, companyId, createdBy);

    res.status(201).json({
      success: true,
      message: 'Approval rule created successfully',
      data: rule
    });
  } catch (error) {
    console.error('Create approval rule error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getRules = async (req, res) => {
  try {
    const companyId = req.user.company._id;
    const { page = 1, limit = 10, is_active } = req.query;

    const filters = {};
    if (is_active !== undefined) {
      filters.is_active = is_active === 'true';
    }

    const result = await approvalRuleService.getRules(
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
    console.error('Get approval rules error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getRule = async (req, res) => {
  try {
    const ruleId = req.params.id;
    const companyId = req.user.company._id;

    const rule = await approvalRuleService.getRule(ruleId, companyId);

    res.json({
      success: true,
      data: rule
    });
  } catch (error) {
    console.error('Get approval rule error:', error);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateRule = async (req, res) => {
  try {
    const ruleId = req.params.id;
    const companyId = req.user.company._id;
    const updateData = req.body;

    const rule = await approvalRuleService.updateRule(ruleId, companyId, updateData);

    res.json({
      success: true,
      message: 'Approval rule updated successfully',
      data: rule
    });
  } catch (error) {
    console.error('Update approval rule error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteRule = async (req, res) => {
  try {
    const ruleId = req.params.id;
    const companyId = req.user.company._id;

    const result = await approvalRuleService.deleteRule(ruleId, companyId);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Delete approval rule error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get available approvers for dropdown
exports.getAvailableApprovers = async (req, res) => {
  try {
    const companyId = req.user.company._id;

    const approvers = await approvalRuleService.getAvailableApprovers(companyId);

    res.json({
      success: true,
      data: approvers
    });
  } catch (error) {
    console.error('Get available approvers error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};