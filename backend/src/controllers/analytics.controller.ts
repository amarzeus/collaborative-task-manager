import { Request, Response, NextFunction } from 'express';
import { analyticsService, AnalyticsScope } from '../services/analytics.service.js';

import { AppError } from '../lib/errors.js';

export const analyticsController = {
  /**
   * Helper to validate and get scope
   */
  getScope(req: Request): AnalyticsScope {
    const scope = (req.query.scope as AnalyticsScope) || 'personal';
    if (scope === 'global' && (req as any).user?.role !== 'ADMIN' && (req as any).user?.role !== 'SUPER_ADMIN') {
      throw AppError.forbidden('Only admins can access global analytics');
    }
    return scope;
  },

  /**
   * GET /api/v1/analytics/trends
   */
  async getTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const scope = analyticsController.getScope(req);
      const days = parseInt(req.query.days as string) || 7;
      const trends = await analyticsService.getCompletionTrends((req as any).user!.id, days, scope);

      res.json({ success: true, data: trends });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/analytics/priorities
   */
  async getPriorities(req: Request, res: Response, next: NextFunction) {
    try {
      const scope = analyticsController.getScope(req);
      const distribution = await analyticsService.getPriorityDistribution((req as any).user!.id, scope);
      res.json({ success: true, data: distribution });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/analytics/productivity
   */
  async getProductivity(req: Request, res: Response, next: NextFunction) {
    try {
      const scope = analyticsController.getScope(req);
      const days = parseInt(req.query.days as string) || 7;
      const metrics = await analyticsService.getProductivityMetrics((req as any).user!.id, scope, days);
      res.json({ success: true, data: metrics });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/analytics/efficiency
   */
  async getEfficiency(req: Request, res: Response, next: NextFunction) {
    try {
      const scope = analyticsController.getScope(req);
      const metrics = await analyticsService.getEfficiencyMetrics((req as any).user!.id, scope);
      res.json({ success: true, data: metrics });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/analytics/heatmap
   */
  async getHeatmap(req: Request, res: Response, next: NextFunction) {
    try {
      const scope = analyticsController.getScope(req);
      const data = await analyticsService.getActivityHeatmap((req as any).user!.id, scope);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/analytics/insights
   */
  async getInsights(req: Request, res: Response, next: NextFunction) {
    try {
      const scope = analyticsController.getScope(req);
      const days = parseInt(req.query.days as string) || 7;
      const insights = await analyticsService.getInsights((req as any).user!.id, scope, days);
      res.json({ success: true, data: insights });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/analytics/dashboard
   */
  async getDashboardData(req: Request, res: Response, next: NextFunction) {
    try {
      const scope = analyticsController.getScope(req);
      const days = parseInt(req.query.days as string) || 7;

      const [trends, priorities, productivity, insights, efficiency, heatmap] = await Promise.all([
        analyticsService.getCompletionTrends((req as any).user!.id, days, scope),
        analyticsService.getPriorityDistribution((req as any).user!.id, scope),
        analyticsService.getProductivityMetrics((req as any).user!.id, scope, days),
        analyticsService.getInsights((req as any).user!.id, scope, days),
        analyticsService.getEfficiencyMetrics((req as any).user!.id, scope),
        analyticsService.getActivityHeatmap((req as any).user!.id, scope),
      ]);

      res.json({
        success: true,
        data: {
          trends,
          priorities,
          productivity,
          insights,
          efficiency,
          heatmap,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
