export const errorHandler = (err, req, res, next) => {
  // Log all errors internally (use proper logger in production)
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERROR ${req.method} ${req.path}:`, err.message);

  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Handle Prisma-specific errors
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Resource not found',
      code: 'NOT_FOUND',
    });
  }

  if (err.code === 'P2002') {
    const field = err.meta?.target?.join(', ') || 'field';
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists`,
      code: 'DUPLICATE_ENTRY',
    });
  }

  if (err.code === 'P2003') {
    return res.status(400).json({
      success: false,
      message: 'Referenced resource does not exist',
      code: 'FOREIGN_KEY_VIOLATION',
    });
  }

  if (err.code === 'P2014') {
    return res.status(400).json({
      success: false,
      message: 'The change would violate a required relationship',
      code: 'RELATION_VIOLATION',
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      code: 'TOKEN_INVALID',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token has expired',
      code: 'TOKEN_EXPIRED',
    });
  }

  // Handle our operational AppError instances
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }

  // Handle unexpected programming errors — never leak details in production
  const isDev = process.env.NODE_ENV === 'development';
  return res.status(500).json({
    success: false,
    message: isDev ? err.message : 'An unexpected error occurred',
    code: 'INTERNAL_SERVER_ERROR',
    ...(isDev && { stack: err.stack }),
  });
};
