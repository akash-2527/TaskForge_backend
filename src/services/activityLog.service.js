import { activityLogRepository } from '../repositories/activityLog.repository.js';

export const activityLogService = {
  async log({ projectId, taskId = null, actorId, action, metadata = null }) {
    try {
      return await activityLogRepository.create({ projectId, taskId, actorId, action, metadata });
    } catch (err) {
      // Log silently — activity logging failures must not break main operations
      console.error('[ActivityLog] Failed to log activity:', err.message);
    }
  },

  async getProjectActivity(projectId) {
    return activityLogRepository.findByProject(projectId);
  },

  async getTaskActivity(taskId) {
    return activityLogRepository.findByTask(taskId);
  },
};
