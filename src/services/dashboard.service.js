import { prisma } from '../config/database.js';
import { projectRepository } from '../repositories/project.repository.js';
import { taskRepository } from '../repositories/task.repository.js';
import { activityLogRepository } from '../repositories/activityLog.repository.js';

export const dashboardService = {
  async getUserDashboard(userId) {
    // Run all queries in parallel for performance
    const [projects, globalTaskStats] = await Promise.all([
      projectRepository.findUserProjects(userId),
      prisma.task.groupBy({
        by: ['status'],
        where: {
          project: { members: { some: { user_id: userId } } },
          is_deleted: false,
        },
        _count: { status: true },
      }),
    ]);

    const formattedProjects = projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      role: p.members[0]?.role || null,
      taskCount: p._count.tasks,
      memberCount: p._count.members,
      updated_at: p.updated_at,
    }));

    const statusMap = {};
    globalTaskStats.forEach((s) => {
      statusMap[s.status] = s._count.status;
    });

    return {
      projects: formattedProjects,
      summary: {
        total_projects: formattedProjects.length,
        total_tasks: (statusMap.TODO || 0) + (statusMap.IN_PROGRESS || 0) + (statusMap.DONE || 0),
        tasks_todo: statusMap.TODO || 0,
        tasks_in_progress: statusMap.IN_PROGRESS || 0,
        tasks_done: statusMap.DONE || 0,
      },
    };
  },

  async getProjectAnalytics(projectId) {
    const [statusCounts, overdueTasks, memberTaskCounts, recentActivity] = await Promise.all([
      taskRepository.getStatusCounts(projectId),
      taskRepository.getOverdueTasks(projectId),
      taskRepository.getTasksPerMember(projectId),
      activityLogRepository.findByProject(projectId, 20),
    ]);

    // Build status breakdown
    const statusBreakdown = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
    statusCounts.forEach((s) => {
      statusBreakdown[s.status] = s._count.status;
    });

    const totalTasks = Object.values(statusBreakdown).reduce((a, b) => a + b, 0);
    const completionRate = totalTasks > 0
      ? Math.round((statusBreakdown.DONE / totalTasks) * 100)
      : 0;

    return {
      statusBreakdown,
      totalTasks,
      completionRate,
      overdueCount: overdueTasks.length,
      overdueTasks,
      memberTaskCounts,
      recentActivity,
    };
  },
};
