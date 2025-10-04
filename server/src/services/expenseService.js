// services/expenseService.js
const Expense = require('../models/Expense');
const Receipt = require('../models/Receipt');
const User = require('../models/User');
const Company = require('../models/Company'); // Add this import
const currencyService = require('./currencyService');
const ocrService = require('./ocrService');

class ExpenseService {
  // Create new expense - directly submit for approval
  async createExpense(expenseData, userId, companyId) {
    const { title, description, amount, currency, category, expense_date, receipt } = expenseData;

    // Get company base currency
    const company = await Company.findById(companyId);
    if (!company) {
      throw new Error('Company not found');
    }

    // Calculate amount in base currency
    const amountInBaseCurrency = await this.calculateBaseCurrencyAmount(
      amount, 
      currency, 
      company.base_currency
    );

    const expense = await Expense.create({
      title,
      description,
      amount,
      currency,
      amount_in_base_currency: amountInBaseCurrency,
      category,
      expense_date: new Date(expense_date),
      user: userId,
      company: companyId,
      receipt: receipt || null,
      status: 'pending_approval',
      submitted_at: new Date()
    });

    console.log(`Expense ${expense._id} created and submitted for approval`);

    return await Expense.findById(expense._id)
      .populate('user', 'name email')
      .populate('receipt')
      .populate('company', 'base_currency');
  }

  // Calculate amount in base currency using external API
  async calculateBaseCurrencyAmount(amount, fromCurrency, toCurrency) {
    try {
      if (fromCurrency === toCurrency) {
        return amount;
      }
      
      console.log(`Converting ${amount} ${fromCurrency} to ${toCurrency}`);
      const convertedAmount = await currencyService.convertCurrency(amount, fromCurrency, toCurrency);
      console.log(`Converted amount: ${convertedAmount} ${toCurrency}`);
      return convertedAmount;
    } catch (error) {
      console.error('Currency conversion failed, using original amount:', error.message);
      return amount; // Fallback to original amount
    }
  }

  // Process receipt OCR using Tesseract.js
  async processReceiptOCR(imageUrl, userId, companyId) {
    try {
      if (!imageUrl) {
        throw new Error('Image URL is required');
      }

      // Process receipt with Tesseract.js
      const ocrData = await ocrService.processReceipt(imageUrl);

      // Create receipt record
      const receipt = await Receipt.create({
        user: userId,
        company: companyId,
        filename: this.generateFilename(imageUrl),
        original_filename: this.getFilenameFromUrl(imageUrl),
        file_path: imageUrl,
        file_size: 0, // Can't determine from URL
        mime_type: 'image/jpeg', // Assume JPEG
        ocr_data: ocrData,
        is_processed: true,
        processed_at: new Date()
      });

      return {
        receipt: await Receipt.findById(receipt._id),
        ocr_data: ocrData
      };
    } catch (error) {
      console.error('OCR processing failed:', error);
      throw new Error(`OCR processing failed: ${error.message}`);
    }
  }

  // Get expenses with filters
  async getExpenses(page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;

    const [expenses, total] = await Promise.all([
      Expense.find(filters)
        .populate('user', 'name email')
        .populate('receipt')
        .populate('company', 'base_currency')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Expense.countDocuments(filters)
    ]);

    return {
      expenses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get expense by ID with authorization check
  async getExpenseById(expenseId, userId, companyId, userRole) {
    const expense = await Expense.findOne({ _id: expenseId, company: companyId })
      .populate('user', 'name email')
      .populate('receipt')
      .populate('company', 'base_currency');

    if (!expense) {
      throw new Error('Expense not found');
    }

    // Authorization check
    if (userRole === 'employee' && expense.user._id.toString() !== userId.toString()) {
      throw new Error('Access denied');
    }

    if (userRole === 'manager') {
      const managedUsers = await this.getManagedUsers(userId);
      if (!managedUsers.includes(expense.user._id.toString())) {
        throw new Error('Access denied');
      }
    }

    return expense;
  }

  // Update expense - only allow updates for pending_approval expenses
  async updateExpense(expenseId, userId, companyId, updateData) {
    const expense = await Expense.findOne({ _id: expenseId, company: companyId });

    if (!expense) {
      throw new Error('Expense not found');
    }

    // Only the owner can update their expense
    if (expense.user.toString() !== userId.toString()) {
      throw new Error('Access denied');
    }

    // Cannot update approved, rejected, or paid expenses
    if (!['pending_approval'].includes(expense.status)) {
      throw new Error('Cannot update expense that is not pending approval');
    }

    // Recalculate base currency amount if amount or currency changed
    if (updateData.amount || updateData.currency) {
      const company = await Company.findById(companyId);
      const amount = updateData.amount || expense.amount;
      const currency = updateData.currency || expense.currency;
      updateData.amount_in_base_currency = await this.calculateBaseCurrencyAmount(
        amount, 
        currency, 
        company.base_currency
      );
    }

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        expense[key] = updateData[key];
      }
    });

    await expense.save();

    return await Expense.findById(expense._id)
      .populate('user', 'name email')
      .populate('receipt')
      .populate('company', 'base_currency');
  }

  // Delete expense - only allow deletion for pending_approval expenses
  async deleteExpense(expenseId, userId, companyId) {
    const expense = await Expense.findOne({ _id: expenseId, company: companyId });

    if (!expense) {
      throw new Error('Expense not found');
    }

    // Only the owner can delete their expense
    if (expense.user.toString() !== userId.toString()) {
      throw new Error('Access denied');
    }

    // Cannot delete approved, rejected, or paid expenses
    if (!['pending_approval'].includes(expense.status)) {
      throw new Error('Cannot delete expense that is not pending approval');
    }

    await Expense.findByIdAndDelete(expenseId);
  }

  // Get users managed by a manager
  async getManagedUsers(managerId) {
    const managedUsers = await User.find({ manager: managerId }).select('_id');
    return managedUsers.map(user => user._id.toString());
  }

  // Helper methods
  generateFilename(url) {
    const timestamp = new Date().getTime();
    const extension = url.split('.').pop().split('?')[0] || 'jpg';
    return `receipt_${timestamp}.${extension}`;
  }

  getFilenameFromUrl(url) {
    return url.split('/').pop().split('?')[0] || 'receipt.jpg';
  }
}

module.exports = new ExpenseService();