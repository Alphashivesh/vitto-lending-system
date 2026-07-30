const express = require('express');
const router = express.Router();
const { evaluateLoanAsync, getLoanStatus } = require('../controllers/decisionController');
const { decisionLimiter } = require('../middlewares/rateLimiter');

// POST /api/decision/:loanId/evaluate (Async Trigger)
router.post('/:loanId/evaluate', decisionLimiter, evaluateLoanAsync);

// GET /api/decision/:loanId/status (Polling endpoint)
router.get('/:loanId/status', getLoanStatus);

module.exports = router;