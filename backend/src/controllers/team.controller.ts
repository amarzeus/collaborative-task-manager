import { Request, Response, NextFunction } from 'express';
import { teamService } from '../services/team.service.js';
import { CreateTeamDto, UpdateTeamDto } from '../dtos/index.js';

export const teamController = {
  /**
   * GET /api/v1/teams
   * List all teams in organization
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      if (!(req as any).tenantScope) {
        return res.status(403).json({ success: false, message: 'Organization context required' });
      }
      const teams = await teamService.list(
        (req as any).tenantScope.organizationId,
        (req as any).user!.id
      );
      res.json({ success: true, data: teams });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/teams
   * Create a new team
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!(req as any).tenantScope) {
        return res.status(403).json({ success: false, message: 'Organization context required' });
      }
      const data = req.body as CreateTeamDto;
      const team = await teamService.create(
        data,
        (req as any).tenantScope.organizationId,
        (req as any).user!.id
      );
      res.status(201).json({ success: true, data: team });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/teams/:id
   * Get team details
   */
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      if (!(req as any).tenantScope) {
        return res.status(403).json({ success: false, message: 'Organization context required' });
      }
      const team = await teamService.getById(
        req.params.id,
        (req as any).tenantScope.organizationId
      );
      res.json({ success: true, data: team });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/v1/teams/:id
   * Update team
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!(req as any).tenantScope) {
        return res.status(403).json({ success: false, message: 'Organization context required' });
      }
      const data = req.body as UpdateTeamDto;
      const team = await teamService.update(
        req.params.id,
        data,
        (req as any).tenantScope.organizationId
      );
      res.json({ success: true, data: team });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/teams/:id
   * Delete team
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      if (!(req as any).tenantScope) {
        return res.status(403).json({ success: false, message: 'Organization context required' });
      }
      await teamService.delete(req.params.id, (req as any).tenantScope.organizationId);
      res.json({ success: true, message: 'Team deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/teams/:id/members
   * Add member to team
   */
  async addMember(req: Request, res: Response, next: NextFunction) {
    try {
      if (!(req as any).tenantScope) {
        return res.status(403).json({ success: false, message: 'Organization context required' });
      }
      const { userId, role } = req.body;
      const member = await teamService.addMember(
        req.params.id,
        userId,
        role,
        (req as any).tenantScope.organizationId,
        (req as any).user!.id
      );
      res.status(201).json({ success: true, data: member });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/teams/:id/members/:userId
   * Remove member from team
   */
  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      if (!(req as any).tenantScope) {
        return res.status(403).json({ success: false, message: 'Organization context required' });
      }
      await teamService.removeMember(
        req.params.id,
        req.params.userId,
        (req as any).tenantScope.organizationId,
        (req as any).user!.id
      );
      res.json({ success: true, message: 'Member removed successfully' });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/v1/teams/:id/members/:userId
   * Update member role
   */
  async updateMemberRole(req: Request, res: Response, next: NextFunction) {
    try {
      if (!(req as any).tenantScope) {
        return res.status(403).json({ success: false, message: 'Organization context required' });
      }
      const { role } = req.body;
      const member = await teamService.updateMemberRole(
        req.params.id,
        req.params.userId,
        role,
        (req as any).tenantScope.organizationId,
        (req as any).user!.id
      );
      res.json({ success: true, data: member });
    } catch (error) {
      next(error);
    }
  },
};
