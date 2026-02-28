const mongoose = require('mongoose');

const connectMongoDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) return;
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    if (typeof process.env.VERCEL === 'undefined') {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectMongoDB;
