import { Router } from 'express';
import authRoutes from './auth.routes.js';
import projectRoutes from './project.routes.js';
import taskRoutes from './task.routes.js';
import memberRoutes from './member.routes.js';
import dashboardRoutes from './dashboard.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);

// Nested project routes with merged params
router.use('/projects/:projectId/tasks', (req, res, next) => {
  // Merge projectId param for nested routers
  req.params.projectId = req.params.projectId;
  next();
}, taskRoutes);

router.use('/projects/:projectId/members', memberRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
