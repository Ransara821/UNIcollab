const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB Connected ✅');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.error('CRITICAL: Please ensure your current IP address is added to the MongoDB Atlas Network Access whitelist.');
  }
};

module.exports = connectDB;