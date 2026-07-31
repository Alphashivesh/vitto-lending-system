const express = require('express');
const router = express.Router();
const { evaluateLoanAsync, getLoanStatus } = require('../controllers/decisionController');
const { decisionLimiter } = require('../middlewares/rateLimiter');

router.get('/:loanId/status', getLoanStatus);

module.exports = router;