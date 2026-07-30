const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectMongo = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB Database.');
    } catch (error) {
        console.error('MongoDB Connection Error:', error.message);
        process.exit(1);
    }
};

module.exports = connectMongo;