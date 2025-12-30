/**
 * Manager Dashboard Controller
 * API endpoints for manager analytics
 */

import { Request, Response, NextFunction } from 'express';
import { managerDashboardService } from '../services/manager-dashboard.service.js';

export const managerDashboardController = {
  /**
   * GET /api/v1/manager/dashboard
   */
  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      if (!(req as any).tenantScope) {
        return res.status(403).json({ success: false, message: 'Organization context required' });
      }
      const overview = await managerDashboardService.getOrgOverview(
        (req as any).tenantScope.organizationId
      );
      res.json({ success: true, data: overview });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/manager/dashboard/teams
   */
  async getTeamComparison(req: Request, res: Response, next: NextFunction) {
    try {
      if (!(req as any).tenantScope) {
        return res.status(403).json({ success: false, message: 'Organization context required' });
      }
      const teams = await managerDashboardService.getTeamComparison(
        (req as any).tenantScope.organizationId
      );
      res.json({ success: true, data: teams });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/manager/dashboard/trends
   */
  async getTrends(req: Request, res: Response, next: NextFunction) {
    try {
      if (!(req as any).tenantScope) {
        return res.status(403).json({ success: false, message: 'Organization context required' });
      }
      const days = parseInt(req.query.days as string) || 14;
      const trends = await managerDashboardService.getOrgTrends(
        (req as any).tenantScope.organizationId,
        days
      );
      res.json({ success: true, data: trends });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/manager/dashboard/performers
   */
  async getTopPerformers(req: Request, res: Response, next: NextFunction) {
    try {
      if (!(req as any).tenantScope) {
        return res.status(403).json({ success: false, message: 'Organization context required' });
      }
      const limit = parseInt(req.query.limit as string) || 10;
      const performers = await managerDashboardService.getTopPerformers(
        (req as any).tenantScope.organizationId,
        limit
      );
      res.json({ success: true, data: performers });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/manager/dashboard/priority
   */
  async getPriorityDistribution(req: Request, res: Response, next: NextFunction) {
    try {
      if (!(req as any).tenantScope) {
        return res.status(403).json({ success: false, message: 'Organization context required' });
      }
      const distribution = await managerDashboardService.getPriorityDistribution(
        (req as any).tenantScope.organizationId
      );
      res.json({ success: true, data: distribution });
    } catch (error) {
      next(error);
    }
  },
};
