import { memberService } from '../services/member.service.js';
import { sendSuccess, sendCreated } from '../utils/response.utils.js';

export const memberController = {
  async getMembers(req, res, next) {
    try {
      const members = await memberService.getProjectMembers(req.params.projectId);
      return sendSuccess(res, members);
    } catch (err) {
      next(err);
    }
  },

  async addMember(req, res, next) {
    try {
      const { email, role } = req.body;
      const member = await memberService.addMember(
        req.params.projectId,
        email,
        role,
        req.user.id
      );
      return sendCreated(res, member, 'Member added successfully');
    } catch (err) {
      next(err);
    }
  },

  async updateMemberRole(req, res, next) {
    try {
      const updated = await memberService.updateMemberRole(
        req.params.projectId,
        req.params.userId,
        req.body.role,
        req.user.id
      );
      return sendSuccess(res, updated, 'Member role updated');
    } catch (err) {
      next(err);
    }
  },

  async removeMember(req, res, next) {
    try {
      await memberService.removeMember(
        req.params.projectId,
        req.params.userId,
        req.user.id
      );
      return sendSuccess(res, null, 'Member removed from project');
    } catch (err) {
      next(err);
    }
  },
};
