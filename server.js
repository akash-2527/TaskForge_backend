import 'dotenv/config';
import { createApp } from './src/app.js';
import { prisma } from './src/config/database.js';

const app = createApp();
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Verify database connection before starting
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Graceful shutdown handlers
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

startServer();
