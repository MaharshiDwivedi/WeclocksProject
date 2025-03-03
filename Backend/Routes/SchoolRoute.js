// SchoolRoute.js
const express = require('express');
const SchoolController = require('../controllers/schoolController');

const router = express.Router();

// Endpoint to get schools with SMC
router.get('/schools-with-smc', SchoolController.getSchoolsWithSMC);

module.exports = router;