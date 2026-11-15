const path = require('path');
// Load environment variables from root or backend directory
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🎓 ScholaVerse Server running in [${process.env.NODE_ENV || 'development'}] mode`);
      console.log(`🚀 Port: http://localhost:${PORT}`);
      console.log(`📑 OpenAPI Docs: http://localhost:${PORT}/api-docs`);
      console.log(`❤️ Health Check: http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });

    const gracefulExit = async () => {
      console.log('\n[Server] Shutting down gracefully...');
      server.close(async () => {
        await disconnectDB();
        console.log('[Server] Closed all connections.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulExit);
    process.on('SIGINT', gracefulExit);
  } catch (error) {
    console.error('[Server Start Failure]', error.message);
    process.exit(1);
  }
};

// Start server listener when executed directly (standalone / local dev)
if (require.main === module || !process.env.VERCEL) {
  startServer();
}

module.exports = app;
