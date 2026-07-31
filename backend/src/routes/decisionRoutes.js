const express = require('express');
const router = express.Router();
const { evaluateLoanAsync, getLoanStatus } = require('../controllers/decisionController');

// Define routes using the correctly imported functions
router.post('/:loanId/evaluate', evaluateLoanAsync);
router.get('/:loanId/status', getLoanStatus);

module.exports = router;