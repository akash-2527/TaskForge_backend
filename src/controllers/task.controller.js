import { taskService } from '../services/task.service.js';
import { sendSuccess, sendCreated } from '../utils/response.utils.js';

export const taskController = {
  async getProjectTasks(req, res, next) {
    try {
      const result = await taskService.getProjectTasks(req.params.projectId, req.query);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async getTask(req, res, next) {
    try {
      const task = await taskService.getTaskById(
        req.params.taskId,
        req.params.projectId
      );
      return sendSuccess(res, task);
    } catch (err) {
      next(err);
    }
  },

  async createTask(req, res, next) {
    try {
      const task = await taskService.createTask(
        req.body,
        req.params.projectId,
        req.user.id
      );
      return sendCreated(res, task, 'Task created successfully');
    } catch (err) {
      next(err);
    }
  },

  async updateTask(req, res, next) {
    try {
      const task = await taskService.updateTask(
        req.params.taskId,
        req.params.projectId,
        req.body,
        req.user.id,
        req.projectRole
      );
      return sendSuccess(res, task, 'Task updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async updateTaskStatus(req, res, next) {
    try {
      const task = await taskService.updateTaskStatus(
        req.params.taskId,
        req.params.projectId,
        req.body.status,
        req.user,
        req.projectRole
      );
      return sendSuccess(res, task, 'Task status updated');
    } catch (err) {
      next(err);
    }
  },

  async deleteTask(req, res, next) {
    try {
      await taskService.deleteTask(
        req.params.taskId,
        req.params.projectId,
        req.user.id
      );
      return sendSuccess(res, null, 'Task deleted successfully');
    } catch (err) {
      next(err);
    }
  },

  async getTaskActivity(req, res, next) {
    try {
      const activity = await taskService.getTaskActivity(
        req.params.taskId,
        req.params.projectId
      );
      return sendSuccess(res, activity);
    } catch (err) {
      next(err);
    }
  },
};
