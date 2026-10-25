const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jira_clone', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected Successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[MongoDB Warning] Could not connect to MongoDB server: ${error.message}`);
    console.warn(`[MongoDB Info] Application will fallback to Mock Store / Local Mode for instant offline testing.`);
    return false;
  }
};

module.exports = connectDB;
