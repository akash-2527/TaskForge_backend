import { prisma } from '../config/database.js';

const SAFE_TASK_SELECT = {
  id: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  due_date: true,
  created_at: true,
  updated_at: true,
  project_id: true,
  assigned_to: true,
  created_by: true,
  assignee: {
    select: { id: true, full_name: true, email: true, avatar_url: true },
  },
  creator: {
    select: { id: true, full_name: true, email: true },
  },
};

export const taskRepository = {
  // ALWAYS scope by both taskId and projectId — prevents cross-project IDOR
  async findTaskInProject(taskId, projectId) {
    return prisma.task.findFirst({
      where: {
        id: taskId,
        project_id: projectId,
        is_deleted: false,
      },
      select: SAFE_TASK_SELECT,
    });
  },

  async findProjectTasks(projectId, filters = {}) {
    const { status, priority, assigned_to, page = 1, limit = 20 } = filters;

    const where = {
      project_id: projectId,
      is_deleted: false,
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assigned_to && { assigned_to }),
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        select: SAFE_TASK_SELECT,
        orderBy: [{ priority: 'desc' }, { created_at: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return { tasks, total, page, limit };
  },

  async create(data) {
    return prisma.task.create({
      data,
      select: SAFE_TASK_SELECT,
    });
  },

  async update(taskId, projectId, data) {
    return prisma.task.update({
      where: { id: taskId },
      data,
      select: SAFE_TASK_SELECT,
    });
  },

  async updateStatus(taskId, status) {
    return prisma.task.update({
      where: { id: taskId },
      data: { status },
      select: SAFE_TASK_SELECT,
    });
  },

  async softDelete(taskId, projectId) {
    return prisma.task.updateMany({
      where: { id: taskId, project_id: projectId },
      data: { is_deleted: true },
    });
  },

  // Dashboard: task counts by status for a project
  async getStatusCounts(projectId) {
    return prisma.task.groupBy({
      by: ['status'],
      where: { project_id: projectId, is_deleted: false },
      _count: { status: true },
    });
  },

  // Dashboard: overdue tasks
  async getOverdueTasks(projectId) {
    return prisma.task.findMany({
      where: {
        project_id: projectId,
        is_deleted: false,
        due_date: { lt: new Date() },
        status: { not: 'DONE' },
      },
      select: SAFE_TASK_SELECT,
      orderBy: { due_date: 'asc' },
    });
  },

  // Dashboard: tasks per member
  async getTasksPerMember(projectId) {
    return prisma.task.groupBy({
      by: ['assigned_to'],
      where: {
        project_id: projectId,
        is_deleted: false,
        assigned_to: { not: null },
      },
      _count: { assigned_to: true },
    });
  },

  // Assign task — verifies assignee is a project member atomically
  async assignTask(taskId, projectId, assigneeId) {
    return prisma.$transaction(async (tx) => {
      if (assigneeId) {
        const isMember = await tx.projectMember.findUnique({
          where: {
            project_id_user_id: { project_id: projectId, user_id: assigneeId },
          },
        });

        if (!isMember) {
          throw new Error('ASSIGNEE_NOT_MEMBER');
        }
      }

      return tx.task.update({
        where: { id: taskId },
        data: { assigned_to: assigneeId },
        select: SAFE_TASK_SELECT,
      });
    });
  },
};
