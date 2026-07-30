-- Table to store business profile information
CREATE TABLE IF NOT EXISTS businesses (
    id SERIAL PRIMARY KEY,
    owner_name VARCHAR(255) NOT NULL,
    pan VARCHAR(10) NOT NULL UNIQUE,
    business_type VARCHAR(100) NOT NULL,
    monthly_revenue NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to store loan application details and the decision result
CREATE TABLE IF NOT EXISTS loan_applications (
    id SERIAL PRIMARY KEY,
    business_id INT REFERENCES businesses(id) ON DELETE CASCADE,
    requested_amount NUMERIC(15, 2) NOT NULL,
    tenure_months INT NOT NULL,
    purpose TEXT NOT NULL,
    decision_status VARCHAR(20) DEFAULT 'Pending',
    credit_score INT,
    reason_codes TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);