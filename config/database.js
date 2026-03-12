const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_db';
        
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        console.log('✅ MongoDB Connected Successfully to:', mongoUri);
        console.log('🗄️  Database: attendance_db');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        console.error('⚠️  Please ensure MongoDB is running on localhost:27017');
        console.error('    Install MongoDB from: https://www.mongodb.com/try/download/community');
        console.error('    Or start MongoDB with: mongod');
        
        // Try to continue anyway, but data won't persist
        console.warn('⚠️  Continuing without database - data will NOT persist!');
    }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed gracefully');
    } catch (error) {
        console.error('Error closing MongoDB connection:', error);
    }
    process.exit(0);
});

module.exports = connectDB;