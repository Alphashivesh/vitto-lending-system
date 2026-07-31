const db = require('../config/pg'); // Your PostgreSQL connection
const AuditLog = require('../models/AuditLog'); // Your MongoDB Audit schema

const createBusinessProfile = async(req, res) => {
    try {
        const { owner_name, pan, business_type, monthly_revenue } = req.body;

        // 1. Basic Validation (Edge Case Handling)
        if (!owner_name || !pan || !business_type || !monthly_revenue) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        if (monthly_revenue < 0) {
            return res.status(400).json({ error: 'Monthly revenue cannot be negative.' });
        }

        // 2. Insert into PostgreSQL
        const query = `
            INSERT INTO businesses (owner_name, pan, business_type, monthly_revenue)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const values = [owner_name, pan, business_type, monthly_revenue];
        const result = await db.query(query, values);
        const newBusiness = result.rows[0];

        // 3. Log the successful request to MongoDB (Audit Trail Bonus Requirement)
        // Wrapped in a .catch() so MongoDB connection issues don't crash the user's request
        if (AuditLog && typeof AuditLog.create === 'function') {
            await AuditLog.create({
                action: 'SUBMIT_PROFILE',
                request_payload: req.body,
                response_payload: newBusiness
            }).catch(err => console.error('MongoDB Audit Error:', err.message));
        }

        // 4. Send Success Response exactly how the frontend expects it
        return res.status(201).json(newBusiness);

    } catch (error) {
        console.error('Error creating business profile:', error);

        // Handle PostgreSQL unique constraint violation for PAN
        if (error.code === '23505') {
            return res.status(409).json({ error: 'A business with this PAN already exists.' });
        }

        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { createBusinessProfile };