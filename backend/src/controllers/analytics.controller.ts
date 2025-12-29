import { Response, NextFunction } from 'express';
import { analyticsService, AnalyticsScope } from '../services/analytics.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { AppError } from '../lib/errors.js';

export const analyticsController = {
  /**
   * Helper to validate and get scope
   */
  getScope(req: AuthenticatedRequest): AnalyticsScope {
    const scope = (req.query.scope as AnalyticsScope) || 'personal';
    if (scope === 'global' && req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
      throw AppError.forbidden('Only admins can access global analytics');
    }
    return scope;
  },

  /**
   * GET /api/v1/analytics/trends
   */
  async getTrends(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const scope = analyticsController.getScope(req);
      const days = parseInt(req.query.days as string) || 7;
      const trends = await analyticsService.getCompletionTrends(req.user!.id, days, scope);

      res.json({ success: true, data: trends });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/analytics/priorities
   */
  async getPriorities(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const scope = analyticsController.getScope(req);
      const distribution = await analyticsService.getPriorityDistribution(req.user!.id, scope);
      res.json({ success: true, data: distribution });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/analytics/productivity
   */
  async getProductivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const scope = analyticsController.getScope(req);
      const days = parseInt(req.query.days as string) || 7;
      const metrics = await analyticsService.getProductivityMetrics(req.user!.id, scope, days);
      res.json({ success: true, data: metrics });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/analytics/efficiency
   */
  async getEfficiency(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const scope = analyticsController.getScope(req);
      const metrics = await analyticsService.getEfficiencyMetrics(req.user!.id, scope);
      res.json({ success: true, data: metrics });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/analytics/heatmap
   */
  async getHeatmap(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const scope = analyticsController.getScope(req);
      const data = await analyticsService.getActivityHeatmap(req.user!.id, scope);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/analytics/insights
   */
  async getInsights(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const scope = analyticsController.getScope(req);
      const days = parseInt(req.query.days as string) || 7;
      const insights = await analyticsService.getInsights(req.user!.id, scope, days);
      res.json({ success: true, data: insights });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/analytics/dashboard
   */
  async getDashboardData(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const scope = analyticsController.getScope(req);
      const days = parseInt(req.query.days as string) || 7;

      const [trends, priorities, productivity, insights, efficiency, heatmap] = await Promise.all([
        analyticsService.getCompletionTrends(req.user!.id, days, scope),
        analyticsService.getPriorityDistribution(req.user!.id, scope),
        analyticsService.getProductivityMetrics(req.user!.id, scope, days),
        analyticsService.getInsights(req.user!.id, scope, days),
        analyticsService.getEfficiencyMetrics(req.user!.id, scope),
        analyticsService.getActivityHeatmap(req.user!.id, scope),
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
