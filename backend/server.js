const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectMongo = require('./src/config/mongo');
const setupSwagger = require('./src/config/swagger');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectMongo();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Swagger Documentation UI
setupSwagger(app); // <-- Make sure this line is included!

// Import Routes
const businessRoutes = require('./src/routes/businessRoutes');
const loanRoutes = require('./src/routes/loanRoutes');
const decisionRoutes = require('./src/routes/decisionRoutes');

// Root Landing Page
app.get('/', (req, res) => {
    const htmlResponse = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vitto MSME Lending API</title>
        <style>
            body {
                font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
                background-color: #f8fafc;
                color: #334155;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            .container {
                background: #ffffff;
                padding: 40px 50px;
                border-radius: 12px;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
                max-width: 500px;
                text-align: center;
                border-top: 5px solid #3b82f6;
            }
            h1 {
                color: #0f172a;
                margin-top: 10px;
                margin-bottom: 15px;
            }
            p {
                font-size: 16px;
                line-height: 1.6;
                color: #64748b;
                margin-bottom: 25px;
            }
            .status-badge {
                display: inline-flex;
                align-items: center;
                padding: 6px 14px;
                background-color: #dcfce7;
                color: #166534;
                border-radius: 9999px;
                font-weight: 600;
                font-size: 14px;
                margin-bottom: 10px;
            }
            .status-dot {
                height: 8px;
                width: 8px;
                background-color: #22c55e;
                border-radius: 50%;
                display: inline-block;
                margin-right: 8px;
            }
            .btn {
                display: inline-block;
                padding: 12px 24px;
                background-color: #3b82f6;
                color: #ffffff;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                transition: background-color 0.2s ease;
            }
            .btn:hover {
                background-color: #2563eb;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="status-badge">
                <span class="status-dot"></span> System Online & Live
            </div>
            <h1>Vitto Lending API</h1>
            <p>Welcome to the core backend engine of the MSME Lending Decision System. This REST API securely processes business profiles, evaluates loan risk asynchronously, and maintains immutable audit logs.</p>
            <a href="/api-docs" class="btn">View Swagger API Docs →</a>
        </div>
    </body>
    </html>
    `;
    res.send(htmlResponse);
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'MSME Lending API is running.' });
});

// Use API Routes
app.use('/api/business', businessRoutes);
app.use('/api/loan', loanRoutes);
app.use('/api/decision', decisionRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});