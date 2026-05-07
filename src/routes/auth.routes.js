import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validateBody } from '../middleware/validateRequest.js';
import { signupSchema, loginSchema } from '../validators/auth.validators.js';
import { authLimiter } from '../config/rateLimit.js';

const router = Router();

// POST /api/auth/signup
router.post('/signup', authLimiter, validateBody(signupSchema), authController.signup);

// POST /api/auth/login
router.post('/login', authLimiter, validateBody(loginSchema), authController.login);

// GET /api/auth/me
router.get('/me', authenticate, authController.me);

export default router;
