import { dashboardService } from '../services/dashboard.service.js';
import { sendSuccess } from '../utils/response.utils.js';

export const dashboardController = {
  async getUserDashboard(req, res, next) {
    try {
      const data = await dashboardService.getUserDashboard(req.user.id);
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  async getProjectAnalytics(req, res, next) {
    try {
      const data = await dashboardService.getProjectAnalytics(req.params.projectId);
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },
};
