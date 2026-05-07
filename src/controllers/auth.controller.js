import { authService } from '../services/auth.service.js';
import { sendSuccess, sendCreated } from '../utils/response.utils.js';

export const authController = {
  async signup(req, res, next) {
    try {
      const { email, password, full_name } = req.body;
      const result = await authService.signup({ email, password, full_name });
      return sendCreated(res, result, 'Account created successfully');
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });
      return sendSuccess(res, result, 'Login successful');
    } catch (err) {
      next(err);
    }
  },

  async me(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.id);
      return sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  },
};
