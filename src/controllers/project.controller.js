import { projectService } from '../services/project.service.js';
import { activityLogService } from '../services/activityLog.service.js';
import { sendSuccess, sendCreated } from '../utils/response.utils.js';

export const projectController = {
  async getUserProjects(req, res, next) {
    try {
      const projects = await projectService.getUserProjects(req.user.id);
      return sendSuccess(res, projects);
    } catch (err) {
      next(err);
    }
  },

  async getProject(req, res, next) {
    try {
      const project = await projectService.getProjectById(req.params.projectId);
      return sendSuccess(res, { ...project, role: req.projectRole });
    } catch (err) {
      next(err);
    }
  },

  async createProject(req, res, next) {
    try {
      const { name, description } = req.body;
      const project = await projectService.createProject({ name, description }, req.user.id);
      return sendCreated(res, project, 'Project created successfully');
    } catch (err) {
      next(err);
    }
  },

  async updateProject(req, res, next) {
    try {
      const updated = await projectService.updateProject(
        req.params.projectId,
        req.body,
        req.user.id
      );
      return sendSuccess(res, updated, 'Project updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async deleteProject(req, res, next) {
    try {
      await projectService.deleteProject(req.params.projectId);
      return sendSuccess(res, null, 'Project deleted successfully');
    } catch (err) {
      next(err);
    }
  },

  async getProjectActivity(req, res, next) {
    try {
      const activity = await activityLogService.getProjectActivity(req.params.projectId);
      return sendSuccess(res, activity);
    } catch (err) {
      next(err);
    }
  },
};
