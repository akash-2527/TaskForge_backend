import { taskRepository } from '../repositories/task.repository.js';
import { activityLogService } from './activityLog.service.js';
import { AppError } from '../utils/AppError.js';

export const taskService = {
  async getProjectTasks(projectId, filters) {
    return taskRepository.findProjectTasks(projectId, filters);
  },

  async getTaskById(taskId, projectId) {
    const task = await taskRepository.findTaskInProject(taskId, projectId);
    if (!task) throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
    return task;
  },

  async createTask(data, projectId, creatorId) {
    // Validate assigned_to is a project member (done in repository with transaction)
    let taskData = {
      project_id: projectId,
      created_by: creatorId,
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status || 'TODO',
      due_date: data.due_date ? new Date(data.due_date) : null,
      assigned_to: data.assigned_to || null,
    };

    // If assigned, verify membership
    if (data.assigned_to) {
      try {
        const task = await taskRepository.assignTask(null, projectId, data.assigned_to);
      } catch (err) {
        if (err.message === 'ASSIGNEE_NOT_MEMBER') {
          throw new AppError('Assigned user is not a member of this project', 400, 'ASSIGNEE_NOT_MEMBER');
        }
      }
    }

    const task = await taskRepository.create(taskData);

    await activityLogService.log({
      projectId,
      taskId: task.id,
      actorId: creatorId,
      action: 'TASK_CREATED',
      metadata: {
        title: task.title,
        priority: task.priority,
        status: task.status,
        assigned_to: task.assigned_to,
      },
    });

    return task;
  },

  async updateTask(taskId, projectId, data, actorId, projectRole) {
    // Verify task exists in this project
    const existing = await taskRepository.findTaskInProject(taskId, projectId);
    if (!existing) throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');

    // If changing assignment, validate new assignee is a project member
    if (data.assigned_to !== undefined) {
      if (data.assigned_to !== null) {
        try {
          await taskRepository.assignTask(taskId, projectId, data.assigned_to);
        } catch (err) {
          if (err.message === 'ASSIGNEE_NOT_MEMBER') {
            throw new AppError('Assigned user is not a member of this project', 400, 'ASSIGNEE_NOT_MEMBER');
          }
          throw err;
        }
      }
    }

    const updateData = {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.due_date !== undefined && { due_date: data.due_date ? new Date(data.due_date) : null }),
      ...(data.assigned_to !== undefined && { assigned_to: data.assigned_to }),
    };

    const updated = await taskRepository.update(taskId, projectId, updateData);

    await activityLogService.log({
      projectId,
      taskId,
      actorId,
      action: 'TASK_UPDATED',
      metadata: {
        updated_fields: Object.keys(data),
        changes: data,
      },
    });

    return updated;
  },

  // MEMBER-accessible: enforce ownership check
  async updateTaskStatus(taskId, projectId, newStatus, requestingUser, projectRole) {
    // Verify task exists in THIS project — prevents cross-project IDOR
    const task = await taskRepository.findTaskInProject(taskId, projectId);
    if (!task) throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');

    // RBAC: MEMBER can only update status of tasks assigned to them
    if (projectRole === 'MEMBER' && task.assigned_to !== requestingUser.id) {
      throw new AppError(
        'Members can only update the status of tasks assigned to them',
        403,
        'OWNERSHIP_VIOLATION'
      );
    }

    const previousStatus = task.status;
    const updated = await taskRepository.updateStatus(taskId, newStatus);

    await activityLogService.log({
      projectId,
      taskId,
      actorId: requestingUser.id,
      action: 'STATUS_CHANGED',
      metadata: { from: previousStatus, to: newStatus },
    });

    return updated;
  },

  async deleteTask(taskId, projectId, actorId) {
    const task = await taskRepository.findTaskInProject(taskId, projectId);
    if (!task) throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');

    await taskRepository.softDelete(taskId, projectId);

    await activityLogService.log({
      projectId,
      taskId,
      actorId,
      action: 'TASK_DELETED',
      metadata: { title: task.title },
    });
  },

  async getTaskActivity(taskId, projectId) {
    const task = await taskRepository.findTaskInProject(taskId, projectId);
    if (!task) throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
    return activityLogService.getTaskActivity(taskId);
  },
};
