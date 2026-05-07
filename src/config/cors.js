export const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
      .split(',')
      .map((o) => o.trim());

    // Allow requests with no origin (mobile apps, Postman) in development
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
};
