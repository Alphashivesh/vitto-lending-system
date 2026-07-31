# Vitto MSME Lending Decision System

**🌐 Live Production Deployments:**
* 🖥️ **Frontend Application (Netlify):** [`https://vitto-lending-system-by-shivesh.netlify.app`](https://vitto-lending-system-by-shivesh.netlify.app)
* ⚙️ **Backend API Service (Render):** [`https://vitto-lending-system-81ee.onrender.com`](https://vitto-lending-system-81ee.onrender.com)
* 📑 **APIs Docs (Swagger):** [`https://vitto-lending-system-81ee.onrender.com/api-docs`](https://vitto-lending-system-81ee.onrender.com/api-docs)

A full-stack, lightweight lending decision engine designed to simulate how digital lenders process MSME applications and generate credit decisions. This system emphasizes clean architecture, real-world edge-case handling, and defensible product logic.

## 🚀 Tech Stack
* **Frontend:** React, Vite, Axios, React Router
* **Backend:** Node.js, Express.js
* **Databases:** PostgreSQL (Relational Core Data) & MongoDB (NoSQL Audit Trail)
* **Security & Middleware:** Joi (Validation), Express-Rate-Limit

---

## ⚙️ Local Setup Instructions

**1. Clone the repository**
```bash
git clone <your-repo-url>
cd vitto-lending-system
```

### 2. Setup Databases

* **PostgreSQL:** Execute the SQL script found in `backend/src/config/init.sql` in your Postgres environment to create the `businesses` and `loan_applications` tables.
* **MongoDB:** Ensure you have a local MongoDB instance running or an active MongoDB Atlas cluster.

### 3. Environment Variables
Create a `.env` file in the `backend/` directory with the following variables:

```env
PORT=5000
PG_URI=your_postgresql_connection_string
MONGO_URI=your_mongodb_connection_string
```

### 4. Start the Application
Open two separate terminals:

**Terminal 1 (Backend):**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```

### 🧠 Decision Engine Logic & Assumptions
The credit engine utilizes a custom scoring model starting with a base score of 900. If the final score drops below 650, the loan is rejected.

**Risk Multipliers & Deductions:**
* **EMI Burden:** Calculates estimated EMI (ignoring interest). If the monthly EMI exceeds 50% of the monthly revenue, deduct 150 points (`HIGH_EMI_BURDEN`).
* **Loan Multiple:** Asking for more than 12x monthly revenue is highly risky. Deduct 100 points (`LOAN_TOO_LARGE`).
* **Tenure Risk:** Tenures under 6 months or over 60 months carry unique default risks. Deduct 50 points (`RISKY_TENURE`).

**Fraud & Sanity Checks:**
* If a business requests a loan amount greater than 50x their monthly revenue, the score instantly drops to 0 resulting in an automatic rejection (`DATA_INCONSISTENCY`).

**Asynchronous Processing:**
* The decision engine simulates real-world heavy processing by pushing the evaluation to the background. The API returns a 202 Accepted state, and the React frontend automatically polls the status endpoint every 2 seconds until the final decision is ready.

---

### 🛡️ Edge Case & Error Handling Strategy
The system is designed to degrade gracefully and protect against malformed data:

* **API Validation:** Uses Joi middleware to intercept missing fields, negative revenue inputs, and malformed PANs before they touch the controller.
* **Rate Limiting:** Protects the decision endpoint from abuse by limiting IPs to 5 evaluation requests per 15-minute window.
* **Silent Auditing:** Uses MongoDB to maintain an immutable background audit trail of all raw submissions and decision outputs without slowing down the primary PostgreSQL transaction.
* **Structured Responses:** All API errors return predictable JSON structures with appropriate HTTP status codes (e.g., 400 for bad data, 409 for duplicate PANs, 429 for rate limits).

---

### 📖 API Documentation

**1. Create Business Profile**
* **Endpoint:** `POST /api/business/profile`
* **Body:** `owner_name` (string), `pan` (string, 10 chars), `business_type` (string), `monthly_revenue` (number).
* **Returns:** 201 Created with business ID.

**2. Submit Loan Application**
* **Endpoint:** `POST /api/loan/apply`
* **Body:** `business_id` (number), `requested_amount` (number), `tenure_months` (number), `purpose` (string).
* **Returns:** 201 Created with loan ID and 'Pending' status.

**3. Trigger Async Loan Evaluation**
* **Endpoint:** `POST /api/decision/:loanId/evaluate`
* **Returns:** 202 Accepted. Triggers background job.

**4. Poll Decision Status**
* **Endpoint:** `GET /api/decision/:loanId/status`
* **Returns:** 200 OK with current processing status, final credit score, and reason codes.