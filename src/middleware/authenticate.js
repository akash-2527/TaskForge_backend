import { verifyAccessToken } from '../utils/jwt.utils.js';
import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';

export const authenticate = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No authentication token provided', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('Malformed authorization header', 401, 'UNAUTHORIZED');
    }

    // 2. Verify JWT signature and expiry
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        throw new AppError('Token has expired', 401, 'TOKEN_EXPIRED');
      }
      throw new AppError('Invalid token', 401, 'TOKEN_INVALID');
    }

    // 3. CRITICAL: Verify user still exists and is active in DB
    // JWT alone is insufficient — account may be deactivated after token issue
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        full_name: true,
        avatar_url: true,
        is_active: true,
      },
    });

    if (!user) {
      throw new AppError('User account no longer exists', 401, 'USER_NOT_FOUND');
    }

    if (!user.is_active) {
      throw new AppError('User account has been deactivated', 401, 'USER_INACTIVE');
    }

    // 4. Attach verified identity — NEVER use req.body.userId for auth decisions
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
