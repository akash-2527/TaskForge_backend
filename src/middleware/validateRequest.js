import { ZodError } from 'zod';

/**
 * Validates req.body against a Zod schema.
 * Strips unknown fields to prevent mass assignment vulnerabilities.
 */
export const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(422).json({
          success: false,
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          errors: err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(err);
    }
  };
};

/**
 * Validates req.params against a Zod schema.
 */
export const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid URL parameters',
          code: 'INVALID_PARAMS',
          errors: err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(err);
    }
  };
};

/**
 * Validates req.query against a Zod schema.
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid query parameters',
          code: 'INVALID_QUERY',
          errors: err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(err);
    }
  };
};
