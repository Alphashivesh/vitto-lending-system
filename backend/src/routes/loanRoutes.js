const express = require('express');
const router = express.Router();
const { applyLoan } = require('../controllers/loanController');
const { validateBody } = require('../middlewares/validate');
const { loanSchema } = require('../middlewares/validationSchemas');

/**
 * @swagger
 * /api/loan/apply:
 * post:
 * summary: Submit a loan application for an existing business
 * tags: [Loan]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - business_id
 * - requested_amount
 * - tenure_months
 * - purpose
 * properties:
 * business_id:
 * type: integer
 * example: 1
 * requested_amount:
 * type: number
 * example: 500000
 * tenure_months:
 * type: integer
 * example: 12
 * purpose:
 * type: string
 * example: Working Capital Expansion
 * responses:
 * 201:
 * description: Loan application submitted with Pending status
 * 400:
 * description: Validation error
 */
router.post('/apply', validateBody(loanSchema), applyLoan);

module.exports = router;