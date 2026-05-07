import { Router } from 'express';
import { projectController } from '../controllers/project.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validateProjectMembership } from '../middleware/validateProject.js';
import { authorize } from '../middleware/authorize.js';
import { validateBody } from '../middleware/validateRequest.js';
import { createProjectSchema, updateProjectSchema } from '../validators/project.validators.js';

const router = Router();

// All project routes require authentication
router.use(authenticate);

// GET /api/projects — list user's projects
router.get('/', projectController.getUserProjects);

// POST /api/projects — create new project
router.post('/', validateBody(createProjectSchema), projectController.createProject);

// Routes below require project membership
router.get('/:projectId', validateProjectMembership, projectController.getProject);

router.patch(
  '/:projectId',
  validateProjectMembership,
  authorize('ADMIN'),
  validateBody(updateProjectSchema),
  projectController.updateProject
);

router.delete(
  '/:projectId',
  validateProjectMembership,
  authorize('ADMIN'),
  projectController.deleteProject
);

router.get(
  '/:projectId/activity',
  validateProjectMembership,
  projectController.getProjectActivity
);

export default router;
