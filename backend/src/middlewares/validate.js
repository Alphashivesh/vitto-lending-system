const Joi = require('joi');

const validateBusinessProfile = (req, res, next) => {
    const schema = Joi.object({
        owner_name: Joi.string().min(2).max(100).required(),
        pan: Joi.string().length(10).alphanum().required().messages({
            'string.length': 'PAN must be exactly 10 characters long.',
            'string.alphanum': 'PAN must only contain letters and numbers.'
        }),
        business_type: Joi.string().valid('Retail', 'Manufacturing', 'Services').required(),
        monthly_revenue: Joi.number().min(0).required()
    });

    const { error } = schema.validate(req.body);

    if (error) {
        // Return a structured error response
        return res.status(400).json({ error: error.details[0].message });
    }

    next(); // If validation passes, move to the controller
};

module.exports = { validateBusinessProfile };