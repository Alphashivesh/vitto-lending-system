const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    connectionString: process.env.PG_URI,
});

pool.on('connect', () => {
    console.log('Connected to PostgreSQL Database.');
});

pool.on('error', (err) => {
    console.error('PostgreSQL Connection Error:', err.message);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};