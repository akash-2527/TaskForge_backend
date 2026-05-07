import { hashPassword, comparePassword } from '../utils/password.utils.js';
import { signAccessToken } from '../utils/jwt.utils.js';
import { userRepository } from '../repositories/user.repository.js';
import { AppError } from '../utils/AppError.js';

export const authService = {
  async signup({ email, password, full_name }) {
    // Check if email already registered
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new AppError('Email address is already registered', 409, 'EMAIL_TAKEN');
    }

    const password_hash = await hashPassword(password);
    const user = await userRepository.create({ email, password_hash, full_name });

    const token = signAccessToken(user.id);
    return { token, user };
  },

  async login({ email, password }) {
    // Fetch user WITH hash for comparison
    const user = await userRepository.findByEmailWithHash(email);

    // Use uniform error for both "not found" and "wrong password" — prevent enumeration
    if (!user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.is_active) {
      throw new AppError('Your account has been deactivated. Contact support.', 401, 'ACCOUNT_INACTIVE');
    }

    // Update last login timestamp
    await userRepository.updateLastLogin(user.id);

    const token = signAccessToken(user.id);

    // Strip password_hash before returning
    const { password_hash: _, ...safeUser } = user;
    return { token, user: safeUser };
  },

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    return user;
  },
};
