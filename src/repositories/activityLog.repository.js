import { prisma } from '../config/database.js';

export const activityLogRepository = {
  async create({ projectId, taskId = null, actorId, action, metadata = null }) {
    return prisma.activityLog.create({
      data: {
        project_id: projectId,
        task_id: taskId,
        actor_id: actorId,
        action,
        metadata,
      },
    });
  },

  async findByProject(projectId, limit = 50) {
    return prisma.activityLog.findMany({
      where: { project_id: projectId },
      include: {
        actor: {
          select: { id: true, full_name: true, email: true, avatar_url: true },
        },
        task: {
          select: { id: true, title: true, is_deleted: true },
        },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  },

  async findByTask(taskId) {
    return prisma.activityLog.findMany({
      where: { task_id: taskId },
      include: {
        actor: {
          select: { id: true, full_name: true, email: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  },
};
