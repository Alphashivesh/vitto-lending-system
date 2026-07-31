// Generic validation middleware that accepts any Joi schema
const validateBody = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            // Extract all error messages into a clean string or array
            const errorMessage = error.details.map((detail) => detail.message).join(', ');
            return res.status(400).json({ error: errorMessage });
        }

        next(); // Validation passed, proceed to controller
    };
};

module.exports = { validateBody };