import { Router } from 'express';
import { memberController } from '../controllers/member.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validateProjectMembership } from '../middleware/validateProject.js';
import { authorize } from '../middleware/authorize.js';
import { validateBody } from '../middleware/validateRequest.js';
import { addMemberSchema, updateMemberRoleSchema } from '../validators/member.validators.js';

const router = Router({
  mergeParams: true
});

router.use(authenticate);
router.use(validateProjectMembership);

// GET /api/projects/:projectId/members
router.get('/', memberController.getMembers);

// POST /api/projects/:projectId/members — ADMIN only
router.post(
  '/',
  authorize('ADMIN'),
  validateBody(addMemberSchema),
  memberController.addMember
);

// PATCH /api/projects/:projectId/members/:userId — ADMIN only
router.patch(
  '/:userId',
  authorize('ADMIN'),
  validateBody(updateMemberRoleSchema),
  memberController.updateMemberRole
);

// DELETE /api/projects/:projectId/members/:userId — ADMIN only
router.delete('/:userId', authorize('ADMIN'), memberController.removeMember);

export default router;
