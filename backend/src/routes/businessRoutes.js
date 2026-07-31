const express = require('express');
const router = express.Router();
const { createBusinessProfile } = require('../controllers/businessController');
const { validateBody } = require('../middlewares/validate');
const { businessSchema } = require('../middlewares/validationSchemas');

/**
 * @swagger
 * /api/business/profile:
 * post:
 * summary: Create a new business profile
 * tags: [Business]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - owner_name
 * - pan
 * - business_type
 * - monthly_revenue
 * properties:
 * owner_name:
 * type: string
 * example: Rajesh Kumar
 * pan:
 * type: string
 * example: ABCDE1234F
 * business_type:
 * type: string
 * example: Retail
 * monthly_revenue:
 * type: number
 * example: 150000
 * responses:
 * 201:
 * description: Business profile created successfully
 * 400:
 * description: Validation error
 */
router.post('/profile', validateBody(businessSchema), createBusinessProfile);

module.exports = router;