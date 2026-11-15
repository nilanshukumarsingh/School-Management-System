const mongoose = require('mongoose');

const connectDB = async (uri = process.env.MONGODB_URI) => {
  try {
    const mongoUri = uri || 'mongodb://127.0.0.1:27017/scholaverse';
    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true, // Build indexes in dev / seeds
    });
    console.log(`[MongoDB] Connected to database: ${conn.connection.name} @ ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('[MongoDB] Disconnected successfully');
  } catch (error) {
    console.error(`[MongoDB] Disconnect error: ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB };
