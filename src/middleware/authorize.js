import { AppError } from '../utils/AppError.js';

/**
 * Factory function that returns middleware enforcing project-scoped role authorization.
 * Must run after authenticate + validateProjectMembership.
 *
 * Usage:
 *   authorize('ADMIN')              — only admins
 *   authorize('ADMIN', 'MEMBER')    — both roles (same as membership check)
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure middleware order is correct
    if (!req.projectRole) {
      return next(
        new AppError(
          'Project role context is missing. Ensure validateProjectMembership runs before authorize.',
          500,
          'MIDDLEWARE_ORDER_ERROR'
        )
      );
    }

    if (!allowedRoles.includes(req.projectRole)) {
      return next(
        new AppError(
          'You do not have permission to perform this action',
          403,
          'INSUFFICIENT_ROLE'
        )
      );
    }

    next();
  };
};
