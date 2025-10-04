// controllers/miscController.js
const miscService = require('../services/miscService');

exports.getCurrencies = async (req, res) => {
  try {
    const currencies = await miscService.getCurrencies();
    
    res.json({
      success: true,
      data: currencies
    });
  } catch (error) {
    console.error('Get currencies error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getCountries = async (req, res) => {
  try {
    const countries = await miscService.getCountries();
    
    res.json({
      success: true,
      data: countries
    });
  } catch (error) {
    console.error('Get countries error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};