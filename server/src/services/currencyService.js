// services/currencyService.js
const axios = require('axios');

class CurrencyService {
  // Convert amount using exchange rate API
  async convertCurrency(amount, fromCurrency, toCurrency) {
    try {
      if (fromCurrency === toCurrency) {
        return amount;
      }

      console.log(`Fetching exchange rate from ${fromCurrency} to ${toCurrency}`);
      
      const response = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`,
        { timeout: 10000 } // 10 second timeout
      );
      
      if (!response.data || !response.data.rates) {
        throw new Error('Invalid response from exchange rate API');
      }
      
      const rate = response.data.rates[toCurrency];
      if (!rate) {
        throw new Error(`Exchange rate not available for ${toCurrency}`);
      }
      
      const convertedAmount = amount * rate;
      return parseFloat(convertedAmount.toFixed(2));
    } catch (error) {
      console.error('Currency conversion error:', error.message);
      
      // Provide more specific error messages
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new Error('Exchange rate service unavailable');
      } else if (error.response && error.response.status === 404) {
        throw new Error(`Currency ${fromCurrency} not supported`);
      } else {
        throw new Error(`Currency conversion failed: ${error.message}`);
      }
    }
  }

  // Get all available currencies from the API
  async getAvailableCurrencies(baseCurrency = 'USD') {
    try {
      const response = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`,
        { timeout: 5000 }
      );
      
      if (response.data && response.data.rates) {
        return Object.keys(response.data.rates);
      }
      
      return ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR']; // Fallback currencies
    } catch (error) {
      console.error('Error fetching currencies:', error.message);
      return ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR']; // Fallback currencies
    }
  }

  // Get exchange rates for multiple currencies
  async getExchangeRates(baseCurrency) {
    try {
      const response = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`,
        { timeout: 5000 }
      );
      
      if (response.data && response.data.rates) {
        return response.data.rates;
      }
      
      throw new Error('Invalid response from exchange rate API');
    } catch (error) {
      console.error('Error fetching exchange rates:', error.message);
      throw new Error('Failed to fetch exchange rates');
    }
  }
}

module.exports = new CurrencyService();