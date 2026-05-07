import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';

/**
 * Validates that the authenticated user is a member of the requested project.
 * Attaches req.projectRole and req.project for downstream use.
 * Must run after authenticate middleware.
 */
export const validateProjectMembership = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;
    const userId = req.user.id; // From authenticate middleware — always trusted

    if (!projectId) {
      throw new AppError('Project ID is required', 400, 'MISSING_PROJECT_ID');
    }

    // Single optimized query: check membership + get role + project status
    const membership = await prisma.projectMember.findUnique({
      where: {
        project_id_user_id: {
          project_id: projectId,
          user_id: userId,
        },
      },
      select: {
        role: true,
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            is_archived: true,
          },
        },
      },
    });

    if (!membership) {
      // Return 404 to avoid confirming project existence to non-members (IDOR protection)
      throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    if (membership.project.is_archived) {
      throw new AppError('This project has been archived', 403, 'PROJECT_ARCHIVED');
    }

    // Attach membership context for controllers and authorize middleware
    req.projectRole = membership.role;
    req.project = membership.project;
    next();
  } catch (err) {
    next(err);
  }
};
