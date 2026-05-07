import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { corsOptions } from './config/cors.js';
import { apiLimiter } from './config/rateLimit.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  // ── Security Headers (must be first) ──────────────────────────────
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    })
  );

  // ── CORS ──────────────────────────────────────────────────────────
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  // ── Body Parsing (with size limit to prevent payload bombs) ───────
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: false, limit: '10kb' }));

  // ── General Rate Limiting ─────────────────────────────────────────
  app.use('/api/', apiLimiter);

  // ── Health Check (before auth middleware) ─────────────────────────
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  });

  // ── API Routes ────────────────────────────────────────────────────
  app.use('/api', routes);

  // ── 404 Handler ───────────────────────────────────────────────────
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.method} ${req.originalUrl} not found`,
      code: 'ROUTE_NOT_FOUND',
    });
  });

  // ── Centralized Error Handler (must be last) ──────────────────────
  app.use(errorHandler);

  return app;
}
