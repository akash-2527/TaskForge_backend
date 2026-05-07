import { projectRepository } from '../repositories/project.repository.js';
import { activityLogService } from './activityLog.service.js';
import { AppError } from '../utils/AppError.js';

export const projectService = {
  async getUserProjects(userId) {
    const projects = await projectRepository.findUserProjects(userId);
    return projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      is_archived: p.is_archived,
      created_at: p.created_at,
      updated_at: p.updated_at,
      role: p.members[0]?.role || null,
      taskCount: p._count.tasks,
      memberCount: p._count.members,
      creator: p.creator,
    }));
  },

  async getProjectById(projectId) {
    const project = await projectRepository.findById(projectId);
    if (!project) throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
    return project;
  },

  async createProject({ name, description }, creatorId) {
    return projectRepository.create({ name, description, creatorId });
  },

  async updateProject(projectId, data, actorId) {
    const updated = await projectRepository.update(projectId, data);

    await activityLogService.log({
      projectId,
      actorId,
      action: 'PROJECT_UPDATED',
      metadata: { updated_fields: Object.keys(data) },
    });

    return updated;
  },

  async deleteProject(projectId) {
    return projectRepository.delete(projectId);
  },
};
