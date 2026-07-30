const db = require('../config/pg'); // Your PostgreSQL connection
const AuditLog = require('../models/AuditLog'); // Your MongoDB Audit schema

const createBusinessProfile = async(req, res) => {
    try {
        const { owner_name, pan, business_type, monthly_revenue } = req.body;

        // 1. Log the incoming request to MongoDB (Audit Trail Bonus Requirement)
        await AuditLog.create({
            action: 'SUBMIT_PROFILE',
            request_payload: req.body
        });

        // 2. Basic Validation (Edge Case Handling)
        if (!owner_name || !pan || !business_type || !monthly_revenue) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        if (monthly_revenue < 0) {
            return res.status(400).json({ error: 'Monthly revenue cannot be negative.' });
        }

        // 3. Insert into PostgreSQL
        const query = `
            INSERT INTO businesses (owner_name, pan, business_type, monthly_revenue)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const values = [owner_name, pan, business_type, monthly_revenue];

        const result = await db.query(query, values);

        // 4. Send Success Response
        res.status(201).json({
            message: 'Business profile created successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error creating business profile:', error);

        // Handle PostgreSQL unique constraint violation for PAN
        if (error.code === '23505') {
            return res.status(409).json({ error: 'A business with this PAN already exists.' });
        }

        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { createBusinessProfile };