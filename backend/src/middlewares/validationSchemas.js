const Joi = require('joi');

const businessSchema = Joi.object({
    owner_name: Joi.string().min(2).max(100).required(),
    pan: Joi.string().length(10).alphanum().required().messages({
        'string.length': 'PAN must be exactly 10 characters long.',
        'string.alphanum': 'PAN must only contain letters and numbers.'
    }),
    business_type: Joi.string().valid('Retail', 'Manufacturing', 'Services').required(),
    monthly_revenue: Joi.number().min(0).required()
});

const loanSchema = Joi.object({
    business_id: Joi.number().integer().required(),
    requested_amount: Joi.number().positive().required(),
    tenure_months: Joi.number().integer().min(1).max(120).required(),
    purpose: Joi.string().required()
});

module.exports = {
    businessSchema,
    loanSchema
};