import { prisma } from '../config/database.js';

export const projectRepository = {
  async findUserProjects(userId) {
    return prisma.project.findMany({
      where: {
        members: { some: { user_id: userId } },
        is_archived: false,
      },
      include: {
        _count: {
          select: {
            tasks: { where: { is_deleted: false } },
            members: true,
          },
        },
        members: {
          where: { user_id: userId },
          select: { role: true },
        },
        creator: {
          select: { id: true, full_name: true, email: true },
        },
      },
      orderBy: { updated_at: 'desc' },
    });
  },

  async findById(projectId) {
    return prisma.project.findUnique({
      where: { id: projectId },
      include: {
        creator: {
          select: { id: true, full_name: true, email: true },
        },
        _count: {
          select: {
            tasks: { where: { is_deleted: false } },
            members: true,
          },
        },
      },
    });
  },

  async create({ name, description, creatorId }) {
    return prisma.$transaction(async (tx) => {
      // Create project
      const project = await tx.project.create({
        data: {
          name,
          description,
          created_by: creatorId,
        },
      });

      // Auto-add creator as ADMIN
      await tx.projectMember.create({
        data: {
          project_id: project.id,
          user_id: creatorId,
          role: 'ADMIN',
        },
      });

      // Log activity
      await tx.activityLog.create({
        data: {
          project_id: project.id,
          actor_id: creatorId,
          action: 'PROJECT_CREATED',
          metadata: { name: project.name },
        },
      });

      return project;
    });
  },

  async update(projectId, data) {
    return prisma.project.update({
      where: { id: projectId },
      data,
    });
  },

  async delete(projectId) {
    // CASCADE handles tasks, members, activity_logs
    return prisma.project.delete({ where: { id: projectId } });
  },
};
