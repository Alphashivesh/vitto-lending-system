const db = require('../config/pg');
const AuditLog = require('../models/AuditLog');

// 1. The Async Trigger (Returns instantly)
const evaluateLoanAsync = async(req, res) => {
    try {
        const { loanId } = req.params;

        // Immediately set status to 'Processing' in PostgreSQL
        await db.query(`UPDATE loan_applications SET decision_status = 'Processing' WHERE id = $1`, [loanId]);

        // Kick off the background simulation (Notice we do NOT use 'await' here)
        simulateBackgroundProcessing(loanId);

        // Return immediately to the client
        res.status(202).json({
            message: 'Loan evaluation started in the background.',
            decision: { status: 'Processing', loanId }
        });
    } catch (error) {
        console.error('Error starting evaluation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// 2. The Simulated Background Worker
const simulateBackgroundProcessing = async(loanId) => {
    // Simulate a 5-second processing delay using setTimeout
    setTimeout(async() => {
        try {
            const query = `
                SELECT l.*, b.monthly_revenue, b.business_type 
                FROM loan_applications l
                JOIN businesses b ON l.business_id = b.id
                WHERE l.id = $1;
            `;
            const result = await db.query(query, [loanId]);
            if (result.rows.length === 0) return;

            const loan = result.rows[0];
            const requestedAmount = parseFloat(loan.requested_amount);
            const monthlyRevenue = parseFloat(loan.monthly_revenue);
            const tenure = parseInt(loan.tenure_months);

            let creditScore = 900;
            let reasonCodes = [];

            const emi = requestedAmount / tenure;
            const emiRatio = emi / monthlyRevenue;
            const loanMultiple = requestedAmount / monthlyRevenue;

            if (loanMultiple > 50) {
                creditScore = 0;
                reasonCodes.push('DATA_INCONSISTENCY');
            } else {
                if (emiRatio > 0.4) { creditScore -= 150;
                    reasonCodes.push('HIGH_EMI_BURDEN'); }
                if (loanMultiple > 12) { creditScore -= 100;
                    reasonCodes.push('LOAN_TOO_LARGE'); }
                if (tenure < 6 || tenure > 60) { creditScore -= 50;
                    reasonCodes.push('RISKY_TENURE'); }
            }

            const decisionStatus = creditScore >= 650 ? 'Approved' : 'Rejected';

            const updateQuery = `
                UPDATE loan_applications
                SET decision_status = $1, credit_score = $2, reason_codes = $3
                WHERE id = $4
                RETURNING *;
            `;
            const updatedLoan = await db.query(updateQuery, [decisionStatus, creditScore, reasonCodes, loanId]);

            await AuditLog.create({
                action: 'ASYNC_EVALUATE_LOAN',
                request_payload: { loanId },
                response_payload: updatedLoan.rows[0],
                status_code: 200
            });
            console.log(`Background job finished for Loan ${loanId}`);
        } catch (error) {
            console.error(`Background job failed for Loan ${loanId}:`, error);
        }
    }, 5000); // 5000 milliseconds = 5 seconds
};

// 3. The Polling Endpoint (Frontend checks this)
const getLoanStatus = async(req, res) => {
    try {
        const { loanId } = req.params;
        const query = `SELECT decision_status, credit_score, reason_codes FROM loan_applications WHERE id = $1`;
        const result = await db.query(query, [loanId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Loan not found.' });
        }

        res.status(200).json({ decision: result.rows[0] });
    } catch (error) {
        console.error('Error fetching loan status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { evaluateLoanAsync, getLoanStatus };