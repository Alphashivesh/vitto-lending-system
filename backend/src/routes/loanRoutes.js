const express = require('express');
const router = express.Router();
const { submitLoanApplication } = require('../controllers/loanController');

// POST /api/loan/apply
router.post('/apply', submitLoanApplication);

module.exports = router;