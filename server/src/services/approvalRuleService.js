// services/approvalRuleService.js
const ApprovalRule = require('../models/ApprovalRule');
const User = require('../models/User');

class ApprovalRuleService {
  // Create new approval rule
  async createRule(ruleData, companyId, createdBy) {
    const { name, description, min_amount, sequential_approvers, conditional_approval, requires_manager_approval_first, priority } = ruleData;

    // Validate approvers exist in the same company
    for (const approver of sequential_approvers) {
      if (approver.approver_id) {
        const user = await User.findOne({ _id: approver.approver_id, company: companyId });
        if (!user) {
          throw new Error(`Approver ${approver.approver_id} not found in company`);
        }
      }
    }

    const rule = await ApprovalRule.create({
      name,
      description,
      min_amount,
      sequential_approvers,
      conditional_approval: conditional_approval || { enabled: false },
      requires_manager_approval_first: requires_manager_approval_first !== false,
      priority: priority || 1,
      company: companyId,
      created_by: createdBy
    });

    return await ApprovalRule.findById(rule._id)
      .populate('sequential_approvers.approver_id', 'name email role')
      .populate('conditional_approval.specific_approvers', 'name email role');
  }

  // Get all rules for company
  async getRules(companyId, page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;

    const query = { company: companyId, ...filters };

    const [rules, total] = await Promise.all([
      ApprovalRule.find(query)
        .populate('sequential_approvers.approver_id', 'name email role')
        .populate('conditional_approval.specific_approvers', 'name email role')
        .populate('created_by', 'name email')
        .sort({ priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ApprovalRule.countDocuments(query)
    ]);

    return {
      rules,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get rule by ID
  async getRule(ruleId, companyId) {
    const rule = await ApprovalRule.findOne({ _id: ruleId, company: companyId })
      .populate('sequential_approvers.approver_id', 'name email role')
      .populate('conditional_approval.specific_approvers', 'name email role')
      .populate('created_by', 'name email');

    if (!rule) {
      throw new Error('Approval rule not found');
    }

    return rule;
  }

  // Update rule
  async updateRule(ruleId, companyId, updateData) {
    const rule = await ApprovalRule.findOne({ _id: ruleId, company: companyId });

    if (!rule) {
      throw new Error('Approval rule not found');
    }

    // Validate approvers if being updated
    if (updateData.sequential_approvers) {
      for (const approver of updateData.sequential_approvers) {
        if (approver.approver_id) {
          const user = await User.findOne({ _id: approver.approver_id, company: companyId });
          if (!user) {
            throw new Error(`Approver ${approver.approver_id} not found in company`);
          }
        }
      }
    }

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        rule[key] = updateData[key];
      }
    });

    await rule.save();

    return await ApprovalRule.findById(rule._id)
      .populate('sequential_approvers.approver_id', 'name email role')
      .populate('conditional_approval.specific_approvers', 'name email role')
      .populate('created_by', 'name email');
  }

  // Delete rule
  async deleteRule(ruleId, companyId) {
    const rule = await ApprovalRule.findOne({ _id: ruleId, company: companyId });

    if (!rule) {
      throw new Error('Approval rule not found');
    }

    await ApprovalRule.findByIdAndDelete(ruleId);
    return { message: 'Approval rule deleted successfully' };
  }

  // Get applicable rules for an expense amount
  async getApplicableRules(amount, companyId) {
    return await ApprovalRule.find({
      company: companyId,
      is_active: true,
      min_amount: { $lte: amount }
    })
    .populate('sequential_approvers.approver_id', 'name email role')
    .populate('conditional_approval.specific_approvers', 'name email role')
    .sort({ priority: -1, min_amount: -1 });
  }

  // Get users who can be assigned as approvers
  async getAvailableApprovers(companyId) {
    return await User.find({
      company: companyId,
      role: { $in: ['manager', 'admin'] },
      is_active: true
    })
    .select('name email role')
    .sort({ name: 1 });
  }
}

module.exports = new ApprovalRuleService();