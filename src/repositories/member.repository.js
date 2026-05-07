import { prisma } from '../config/database.js';

export const memberRepository = {
  async findProjectMembers(projectId) {
    return prisma.projectMember.findMany({
      where: { project_id: projectId },
      select: {
        id: true,
        role: true,
        joined_at: true,
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
            avatar_url: true,
            is_active: true,
          },
        },
      },
      orderBy: [{ role: 'asc' }, { joined_at: 'asc' }],
    });
  },

  async findMembership(projectId, userId) {
    return prisma.projectMember.findUnique({
      where: {
        project_id_user_id: { project_id: projectId, user_id: userId },
      },
    });
  },

  async addMember(projectId, userId, role = 'MEMBER') {
    return prisma.projectMember.create({
      data: { project_id: projectId, user_id: userId, role },
      select: {
        id: true,
        role: true,
        joined_at: true,
        user: {
          select: { id: true, full_name: true, email: true, avatar_url: true },
        },
      },
    });
  },

  async updateRole(projectId, userId, role) {
    return prisma.projectMember.update({
      where: {
        project_id_user_id: { project_id: projectId, user_id: userId },
      },
      data: { role },
      select: {
        id: true,
        role: true,
        user: {
          select: { id: true, full_name: true, email: true },
        },
      },
    });
  },

  async removeMember(projectId, userId) {
    return prisma.projectMember.delete({
      where: {
        project_id_user_id: { project_id: projectId, user_id: userId },
      },
    });
  },

  async countAdmins(projectId) {
    return prisma.projectMember.count({
      where: { project_id: projectId, role: 'ADMIN' },
    });
  },
};
