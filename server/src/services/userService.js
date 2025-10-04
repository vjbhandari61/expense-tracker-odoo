const User = require('../models/User');
const Company = require('../models/Company');

class UserService {
  async createUser(userData, companyId, createdByUserId) {
    const creator = await User.findOne({ 
      _id: createdByUserId, 
      company: companyId,
      role: 'admin'
    });
    
    if (!creator) {
      throw new Error('Only admins can create users');
    }

    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    if (userData.manager) {
      const manager = await User.findOne({
        _id: userData.manager,
        company: companyId
      });
      
      if (!manager) {
        throw new Error('Manager not found in the same company');
      }
    }

    const user = await User.create({
      ...userData,
      company: companyId
    });

    return User.findById(user._id)
      .populate('manager', 'name email')
      .select('-password_hash');
  }

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
}
module.exports = new UserService();