import { prisma } from '../config/database.js';

export const userRepository = {
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        full_name: true,
        avatar_url: true,
        is_active: true,
        created_at: true,
      },
    });
  },

  async findByEmailWithHash(email) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        full_name: true,
        avatar_url: true,
        is_active: true,
        password_hash: true,
        created_at: true,
      },
    });
  },

  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        full_name: true,
        avatar_url: true,
        is_active: true,
        last_login_at: true,
        created_at: true,
      },
    });
  },

  async create({ email, password_hash, full_name }) {
    return prisma.user.create({
      data: { email, password_hash, full_name },
      select: {
        id: true,
        email: true,
        full_name: true,
        avatar_url: true,
        is_active: true,
        created_at: true,
      },
    });
  },

  async updateLastLogin(id) {
    return prisma.user.update({
      where: { id },
      data: { last_login_at: new Date() },
      select: { id: true },
    });
  },

  async searchByEmail(email, excludeProjectId) {
    return prisma.user.findMany({
      where: {
        email: { contains: email, mode: 'insensitive' },
        is_active: true,
        // Exclude users already in the project
        projectMemberships: {
          none: { project_id: excludeProjectId },
        },
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        avatar_url: true,
      },
      take: 10,
    });
  },
};
