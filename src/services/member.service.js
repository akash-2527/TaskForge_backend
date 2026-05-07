import { memberRepository } from '../repositories/member.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { activityLogService } from './activityLog.service.js';
import { AppError } from '../utils/AppError.js';

export const memberService = {
  async getProjectMembers(projectId) {
    return memberRepository.findProjectMembers(projectId);
  },

  async addMember(projectId, email, role, actorId) {
    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('User with this email address not found', 404, 'USER_NOT_FOUND');
    }

    if (!user.is_active) {
      throw new AppError('This user account is inactive', 400, 'USER_INACTIVE');
    }

    // Check not already a member
    const existing = await memberRepository.findMembership(projectId, user.id);
    if (existing) {
      throw new AppError('User is already a member of this project', 409, 'ALREADY_MEMBER');
    }

    const member = await memberRepository.addMember(projectId, user.id, role);

    await activityLogService.log({
      projectId,
      actorId,
      action: 'MEMBER_ADDED',
      metadata: {
        added_user_id: user.id,
        added_user_email: user.email,
        role,
      },
    });

    return member;
  },

  async updateMemberRole(projectId, targetUserId, newRole, actorId) {
    // Prevent demoting yourself if you're the only admin
    if (newRole === 'MEMBER' && targetUserId === actorId) {
      const adminCount = await memberRepository.countAdmins(projectId);
      if (adminCount <= 1) {
        throw new AppError(
          'Cannot demote yourself — you are the only admin. Promote another member first.',
          400,
          'LAST_ADMIN'
        );
      }
    }

    const membership = await memberRepository.findMembership(projectId, targetUserId);
    if (!membership) {
      throw new AppError('User is not a member of this project', 404, 'MEMBER_NOT_FOUND');
    }

    const updated = await memberRepository.updateRole(projectId, targetUserId, newRole);

    await activityLogService.log({
      projectId,
      actorId,
      action: 'MEMBER_ADDED',
      metadata: {
        target_user_id: targetUserId,
        from_role: membership.role,
        to_role: newRole,
      },
    });

    return updated;
  },

  async removeMember(projectId, targetUserId, actorId) {
    const membership = await memberRepository.findMembership(projectId, targetUserId);
    if (!membership) {
      throw new AppError('User is not a member of this project', 404, 'MEMBER_NOT_FOUND');
    }

    // Prevent removing the last admin
    if (membership.role === 'ADMIN') {
      const adminCount = await memberRepository.countAdmins(projectId);
      if (adminCount <= 1) {
        throw new AppError(
          'Cannot remove the last admin of a project. Transfer admin rights first.',
          400,
          'LAST_ADMIN'
        );
      }
    }

    await memberRepository.removeMember(projectId, targetUserId);

    await activityLogService.log({
      projectId,
      actorId,
      action: 'MEMBER_REMOVED',
      metadata: {
        removed_user_id: targetUserId,
        previous_role: membership.role,
      },
    });
  },
};
