import { Router } from 'express';
import { taskController } from '../controllers/task.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validateProjectMembership } from '../middleware/validateProject.js';
import { authorize } from '../middleware/authorize.js';
import { validateBody } from '../middleware/validateRequest.js';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from '../validators/task.validators.js';

const router = Router({
  mergeParams: true
});

// All routes: authenticate + project membership
router.use(authenticate);
router.use(validateProjectMembership);

// GET /api/projects/:projectId/tasks
router.get('/', taskController.getProjectTasks);

// POST /api/projects/:projectId/tasks — ADMIN only
router.post(
  '/',
  authorize('ADMIN'),
  validateBody(createTaskSchema),
  taskController.createTask
);

// GET /api/projects/:projectId/tasks/:taskId
router.get('/:taskId', taskController.getTask);

// GET /api/projects/:projectId/tasks/:taskId/activity
router.get('/:taskId/activity', taskController.getTaskActivity);

// PATCH /api/projects/:projectId/tasks/:taskId — ADMIN full update
router.patch(
  '/:taskId',
  authorize('ADMIN'),
  validateBody(updateTaskSchema),
  taskController.updateTask
);

// PATCH /api/projects/:projectId/tasks/:taskId/status — MEMBER can update own task status
router.patch(
  '/:taskId/status',
  validateBody(updateTaskStatusSchema),
  taskController.updateTaskStatus  // Ownership check in service layer
);

// DELETE /api/projects/:projectId/tasks/:taskId — ADMIN only
router.delete('/:taskId', authorize('ADMIN'), taskController.deleteTask);

export default router;
