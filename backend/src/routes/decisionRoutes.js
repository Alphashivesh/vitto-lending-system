const express = require('express');
const router = express.Router();
const { evaluateLoanAsync, getLoanStatus } = require('../controllers/decisionController');
const { decisionLimiter } = require('../middlewares/rateLimiter');

/**
 * @swagger
 * /api/decision/{loanId}/evaluate:
 * post:
 * summary: Trigger async background credit evaluation for a loan
 * tags: [Decision Engine]
 * parameters:
 * - in: path
 * name: loanId
 * required: true
 * schema:
 * type: integer
 * description: The loan application ID
 * responses:
 * 202:
 * description: Evaluation request accepted and processing started in background
 * 404:
 * description: Loan application not found
 */
router.post('/:loanId/evaluate', decisionLimiter, evaluateLoanAsync);

/**
 * @swagger
 * /api/decision/{loanId}/status:
 * get:
 * summary: Poll the current status of a loan credit evaluation
 * tags: [Decision Engine]
 * parameters:
 * - in: path
 * name: loanId
 * required: true
 * schema:
 * type: integer
 * description: The loan application ID
 * responses:
 * 200:
 * description: Returns current status along with score and reasons
 * 404:
 * description: Loan or decision record not found
 */
router.get('/:loanId/status', getLoanStatus);

module.exports = router;