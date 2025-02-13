// routes/smcRoutes.js
const express = require('express');
const expenceController = require('../controllers/expenceController');

const router = express.Router();

router.post('/expenceData', expenceController.getData);


module.exports = router;
