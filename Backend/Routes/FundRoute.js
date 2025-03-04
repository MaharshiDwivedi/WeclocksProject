// routes/FundRoute.js
const express = require('express');
const FundController = require('../controllers/FundController');

const router = express.Router();

// Endpoint to get fund distribution data
router.get('/fund-distribution', FundController.getFundDistribution);

// Endpoint to get all schools
router.get('/schools', FundController.getAllSchools);

// Endpoint to add fund distribution
router.post('/fund-distribution', FundController.addFundDistribution);

router.delete('/fund-distribution/:id', FundController.deleteFund);

router.put('/fund-distribution/:id', FundController.updateFund);



module.exports = router;
