// services/userService.js
const User = require('../models/User');

class UserService {
  // Get all users in a company
  async getCompanyUsers(companyId, page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;
    
    const query = { 
      company: companyId, 
      ...filters 
    };

    const [users, total] = await Promise.all([
      User.find(query)
        .populate('manager', 'name email')
        .select('-password_hash')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments(query)
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Create new user (only admin can create users in their company)
  async createUser(userData, companyId, createdByUserId) {
    const { name, email, role, manager } = userData;

    // Verify the creator is admin in the same company
    const creator = await User.findOne({ 
      _id: createdByUserId, 
      company: companyId 
    });
    
    if (!creator || creator.role !== 'admin') {
      throw new Error('Only admins can create users');
    }

    // Check if email exists in ANY company
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Generate a default password (in production, you might send invitation email)
    const defaultPassword = 'Welcome123'; // You can generate random password

    // Validate manager exists in same company if provided
    if (manager) {
      const managerUser = await User.findOne({
        _id: manager,
        company: companyId
      });
      
      if (!managerUser) {
        throw new Error('Manager not found in the same company');
      }
    }

    // Create user with company reference
    const user = await User.create({
      name,
      email,
      password_hash: defaultPassword, // Will be hashed by pre-save middleware
      role: role || 'employee',
      company: companyId,
      manager: manager || null
    });

    return User.findById(user._id)
      .populate('manager', 'name email')
      .select('-password_hash');
  }

  // Update user
  async updateUser(userId, companyId, updateData) {
    const user = await User.findOne({ 
      _id: userId, 
      company: companyId 
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Prevent updating email to an existing one
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findOne({
        email: updateData.email,
        _id: { $ne: userId }
      });

      if (existingUser) {
        throw new Error('Another user with this email already exists');
      }
    }

    // Validate manager exists in same company if provided
    if (updateData.manager && updateData.manager !== user.manager?.toString()) {
      const manager = await User.findOne({
        _id: updateData.manager,
        company: companyId
      });
      
      if (!manager) {
        throw new Error('Manager not found in the same company');
      }
    }

    // Update user (exclude password from regular update)
    const { password, ...safeUpdateData } = updateData;
    Object.keys(safeUpdateData).forEach(key => {
      if (safeUpdateData[key] !== undefined) {
        user[key] = safeUpdateData[key];
      }
    });

    await user.save();
    
    return User.findById(user._id)
      .populate('manager', 'name email')
      .select('-password_hash');
  }

  // Delete user (soft delete)
  async deleteUser(userId, companyId) {
    const user = await User.findOne({ 
      _id: userId, 
      company: companyId 
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user is managing other users
    const managedUsers = await User.countDocuments({ 
      manager: userId, 
      company: companyId 
    });

    if (managedUsers > 0) {
      throw new Error('Cannot delete user who is managing other users');
    }

    // Soft delete by setting is_active to false
    user.is_active = false;
    await user.save();

    return { message: 'User deleted successfully' };
  }

  // Get user by ID
  async getUserById(userId, companyId) {
    const user = await User.findOne({ 
      _id: userId, 
      company: companyId 
    })
      .populate('manager', 'name email')
      .populate('company', 'name base_currency country')
      .select('-password_hash');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  // Get managers in a company
  async getCompanyManagers(companyId) {
    return await User.find({
      company: companyId,
      role: { $in: ['manager', 'admin'] },
      is_active: true
    })
    .select('name email role')
    .sort({ name: 1 });
  }
}

module.exports = new UserService();