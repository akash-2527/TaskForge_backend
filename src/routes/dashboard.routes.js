import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validateProjectMembership } from '../middleware/validateProject.js';

const router = Router();

router.use(authenticate);

// GET /api/dashboard
router.get('/', dashboardController.getUserDashboard);

// GET /api/dashboard/projects/:projectId/analytics
router.get(
  '/projects/:projectId/analytics',
  validateProjectMembership,
  dashboardController.getProjectAnalytics
);

export default router;
