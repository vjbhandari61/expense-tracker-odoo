// services/miscService.js
const axios = require('axios');

class MiscService {
  // Get all currencies with exchange rates
  async getCurrencies() {
    try {
      // Get base currencies from REST Countries API
      const countriesResponse = await axios.get(
        'https://restcountries.com/v3.1/all?fields=name,currencies'
      );
      
      // Extract unique currencies
      const currencyMap = new Map();
      
      countriesResponse.data.forEach(country => {
        if (country.currencies) {
          Object.entries(country.currencies).forEach(([code, currency]) => {
            if (!currencyMap.has(code)) {
              currencyMap.set(code, {
                code: code,
                name: currency.name,
                symbol: currency.symbol || code
              });
            }
          });
        }
      });

      // Convert map to array and sort
      const currencies = Array.from(currencyMap.values()).sort((a, b) => 
        a.code.localeCompare(b.code)
      );

      // Get exchange rates for major currencies
      const majorCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR'];
      const exchangeRates = await this.getExchangeRatesForMajorCurrencies(majorCurrencies);

      return {
        currencies,
        exchange_rates: exchangeRates,
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching currencies:', error.message);
      
      // Fallback to common currencies if API fails
      return this.getFallbackCurrencies();
    }
  }

  // Get exchange rates for major currencies
  async getExchangeRatesForMajorCurrencies(currencies) {
    try {
      const baseCurrency = 'USD';
      const response = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
      );

      const rates = {};
      currencies.forEach(currency => {
        if (response.data.rates[currency]) {
          rates[currency] = response.data.rates[currency];
        }
      });

      return {
        base: baseCurrency,
        rates,
        date: response.data.date
      };
    } catch (error) {
      console.error('Error fetching exchange rates:', error.message);
      return {
        base: 'USD',
        rates: {},
        date: new Date().toISOString().split('T')[0]
      };
    }
  }

  // Get all countries with their currencies
  async getCountries() {
    try {
      const response = await axios.get(
        'https://restcountries.com/v3.1/all?fields=name,cca2,currencies,flags'
      );

      const countries = response.data.map(country => ({
        code: country.cca2,
        name: country.name.common,
        official_name: country.name.official,
        flag: country.flags?.png || country.flags?.svg,
        currencies: country.currencies ? Object.keys(country.currencies) : []
      })).sort((a, b) => a.name.localeCompare(b.name));

      return {
        countries,
        total: countries.length,
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching countries:', error.message);
      
      // Fallback to common countries if API fails
      return this.getFallbackCountries();
    }
  }

  // Fallback currencies if API fails
  getFallbackCurrencies() {
    const commonCurrencies = [
      { code: 'USD', name: 'United States Dollar', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
      { code: 'GBP', name: 'British Pound', symbol: '£' },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
      { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
      { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
      { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
      { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' }
    ];

    return {
      currencies: commonCurrencies,
      exchange_rates: {
        base: 'USD',
        rates: {
          EUR: 0.85,
          GBP: 0.73,
          JPY: 110.25,
          CAD: 1.25,
          AUD: 1.35,
          INR: 74.50
        },
        date: new Date().toISOString().split('T')[0]
      },
      last_updated: new Date().toISOString()
    };
  }

  // Fallback countries if API fails
  getFallbackCountries() {
    const commonCountries = [
      { code: 'US', name: 'United States', official_name: 'United States of America', currencies: ['USD'] },
      { code: 'GB', name: 'United Kingdom', official_name: 'United Kingdom of Great Britain and Northern Ireland', currencies: ['GBP'] },
      { code: 'CA', name: 'Canada', official_name: 'Canada', currencies: ['CAD'] },
      { code: 'AU', name: 'Australia', official_name: 'Commonwealth of Australia', currencies: ['AUD'] },
      { code: 'IN', name: 'India', official_name: 'Republic of India', currencies: ['INR'] },
      { code: 'DE', name: 'Germany', official_name: 'Federal Republic of Germany', currencies: ['EUR'] },
      { code: 'FR', name: 'France', official_name: 'French Republic', currencies: ['EUR'] },
      { code: 'JP', name: 'Japan', official_name: 'Japan', currencies: ['JPY'] },
      { code: 'CN', name: 'China', official_name: "People's Republic of China", currencies: ['CNY'] },
      { code: 'BR', name: 'Brazil', official_name: 'Federative Republic of Brazil', currencies: ['BRL'] }
    ];

    return {
      countries: commonCountries,
      total: commonCountries.length,
      last_updated: new Date().toISOString()
    };
  }

  // Get currency by code
  async getCurrencyByCode(currencyCode) {
    try {
      const currenciesData = await this.getCurrencies();
      const currency = currenciesData.currencies.find(c => c.code === currencyCode.toUpperCase());
      
      if (!currency) {
        throw new Error(`Currency ${currencyCode} not found`);
      }

      return currency;
    } catch (error) {
      throw new Error(`Failed to get currency: ${error.message}`);
    }
  }

  // Get country by code
  async getCountryByCode(countryCode) {
    try {
      const countriesData = await this.getCountries();
      const country = countriesData.countries.find(c => c.code === countryCode.toUpperCase());
      
      if (!country) {
        throw new Error(`Country ${countryCode} not found`);
      }

      return country;
    } catch (error) {
      throw new Error(`Failed to get country: ${error.message}`);
    }
  }
}

module.exports = new MiscService();