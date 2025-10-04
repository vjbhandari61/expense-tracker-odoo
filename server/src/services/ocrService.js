// services/ocrService.js
const Tesseract = require('tesseract.js');
const axios = require('axios');

class OCRService {
  // Extract text from image URL using Tesseract.js
  async extractTextFromImage(imageUrl) {
    try {
      console.log('Starting OCR processing for:', imageUrl);
      
      const { data: { text } } = await Tesseract.recognize(
        imageUrl,
        'eng', // English language
        {
          logger: m => console.log(m) // Optional: log progress
        }
      );

      console.log('OCR extracted text:', text);
      return text;
    } catch (error) {
      console.error('OCR processing error:', error);
      throw new Error(`OCR processing failed: ${error.message}`);
    }
  }

  // Parse OCR text to extract structured data
  async parseReceiptData(ocrText) {
    try {
      const lines = ocrText.split('\n').filter(line => line.trim());
      
      const parsedData = {
        extracted_amount: this.extractAmount(ocrText),
        extracted_date: this.extractDate(ocrText),
        extracted_merchant: this.extractMerchant(lines),
        extracted_items: this.extractItems(lines),
        confidence_score: 0.8, // Tesseract doesn't provide confidence per field
        raw_ocr_text: ocrText
      };

      // Auto-categorize based on merchant or items
      parsedData.extracted_category = this.categorizeExpense(parsedData);

      return parsedData;
    } catch (error) {
      console.error('Error parsing OCR data:', error);
      throw new Error('Failed to parse OCR data');
    }
  }

  // Extract amount from OCR text
  extractAmount(text) {
    const amountRegex = /(?:total|amount|balance|due)\s*[:$]?\s*[\$]?(\d+[.,]\d{2})/gi;
    const matches = text.match(amountRegex);
    
    if (matches) {
      const amountMatch = matches[0].match(/(\d+[.,]\d{2})/);
      if (amountMatch) {
        return parseFloat(amountMatch[1].replace(',', '.'));
      }
    }
    
    // Fallback: look for any number with 2 decimal places
    const fallbackAmount = text.match(/\d+[.,]\d{2}/);
    return fallbackAmount ? parseFloat(fallbackAmount[0].replace(',', '.')) : null;
  }

  // Extract date from OCR text
  extractDate(text) {
    const dateRegex = /(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})|(\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2})/g;
    const matches = text.match(dateRegex);
    
    if (matches) {
      try {
        return new Date(matches[0]);
      } catch (error) {
        console.log('Date parsing failed, using current date');
      }
    }
    
    return new Date(); // Fallback to current date
  }

  // Extract merchant name (usually first line or contains common merchant keywords)
  extractMerchant(lines) {
    const merchantKeywords = ['restaurant', 'cafe', 'hotel', 'market', 'store', 'shop', 'gas', 'airline'];
    
    for (const line of lines.slice(0, 3)) { // Check first 3 lines
      const upperLine = line.toUpperCase();
      if (upperLine.length > 3 && upperLine.length < 50 && 
          !upperLine.match(/(\d+[.,]\d{2})|(TOTAL|AMOUNT|DATE|RECEIPT)/)) {
        return line.trim();
      }
    }
    
    return 'Unknown Merchant';
  }

  // Extract line items (lines that look like items with prices)
  extractItems(lines) {
    const items = [];
    const itemPriceRegex = /(.+?)\s+(\d+[.,]\d{2})$/;
    
    for (const line of lines) {
      const match = line.match(itemPriceRegex);
      if (match && !line.match(/(TOTAL|SUBTOAL|TAX|AMOUNT|BALANCE)/i)) {
        items.push({
          description: match[1].trim(),
          amount: parseFloat(match[2].replace(',', '.'))
        });
      }
    }
    
    return items.length > 0 ? items : [{ description: 'General Expense', amount: this.extractAmount(lines.join(' ')) || 0 }];
  }

  // Categorize expense based on merchant or items
  categorizeExpense(parsedData) {
    const { extracted_merchant, extracted_items } = parsedData;
    const merchant = extracted_merchant.toLowerCase();
    const items = extracted_items.map(item => item.description.toLowerCase()).join(' ');

    if (merchant.includes('hotel') || merchant.includes('airline') || items.includes('flight') || items.includes('hotel')) {
      return 'travel';
    } else if (merchant.includes('restaurant') || merchant.includes('cafe') || merchant.includes('food')) {
      return 'meals';
    } else if (merchant.includes('office') || merchant.includes('store') || items.includes('pen') || items.includes('paper')) {
      return 'office_supplies';
    } else if (merchant.includes('electronics') || items.includes('laptop') || items.includes('phone')) {
      return 'equipment';
    } else {
      return 'other';
    }
  }

  // Main method to process receipt from URL
  async processReceipt(imageUrl) {
    try {
      console.log('Processing receipt from URL:', imageUrl);
      
      // Extract text using Tesseract
      const ocrText = await this.extractTextFromImage(imageUrl);
      
      // Parse the extracted text
      const parsedData = await this.parseReceiptData(ocrText);
      
      console.log('Receipt processing completed:', parsedData);
      return parsedData;
    } catch (error) {
      console.error('Receipt processing failed:', error);
      throw error;
    }
  }
}

module.exports = new OCRService();