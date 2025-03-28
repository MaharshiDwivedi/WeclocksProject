// routes/expenseRoute.js
const express = require('express');
const expenseController = require('../controllers/expenceController');

const router = express.Router();

router.post('/expenceData', expenseController.getData);
router.post('/yearlyExpenseData', expenseController.getYearlyData);

module.exports = router;