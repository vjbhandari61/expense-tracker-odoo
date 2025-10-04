const express = require('express');
const router = express.Router();
const miscController = require('../controllers/miscController');

// Public routes
router.get('/currencies', miscController.getCurrencies);
router.get('/countries', miscController.getCountries);

module.exports = router;