const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectMongo = require('./src/config/mongo');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectMongo();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const businessRoutes = require('./src/routes/businessRoutes');
const loanRoutes = require('./src/routes/loanRoutes');
const decisionRoutes = require('./src/routes/decisionRoutes');

// Use Routes
app.use('/api/business', businessRoutes);
app.use('/api/loan', loanRoutes);
app.use('/api/decision', decisionRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'MSME Lending API is running.' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});