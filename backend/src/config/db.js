const mongoose = require('mongoose');

const connectDB = async (uri = process.env.MONGODB_URI) => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const primaryUri = uri || 'mongodb://127.0.0.1:27017/scholaverse';
  const localFallback = 'mongodb://127.0.0.1:27017/scholaverse';

  try {
    const conn = await mongoose.connect(primaryUri, {
      autoIndex: process.env.NODE_ENV !== 'production',
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected to database: ${conn.connection.name} @ ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB] Primary connection attempt failed: ${error.message}`);

    // If primary failed on local machine (e.g. Atlas bad auth or network offline),
    // automatically fall back to local running MongoDB instance
    if (!process.env.VERCEL && primaryUri !== localFallback) {
      try {
        console.log(`[MongoDB] Attempting fallback to local instance: ${localFallback}...`);
        const fallbackConn = await mongoose.connect(localFallback, {
          autoIndex: true,
          serverSelectionTimeoutMS: 5000,
        });
        console.log(
          `[MongoDB] Successfully connected to fallback local database: ${fallbackConn.connection.name}`
        );
        return fallbackConn;
      } catch (fallbackError) {
        console.error(`[MongoDB] Local fallback failed: ${fallbackError.message}`);
      }
    }

    if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
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
