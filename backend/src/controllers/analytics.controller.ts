/**
 * Analytics Controller
 * HTTP endpoints for analytics data
 */

import { Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const analyticsController = {
  /**
   * GET /api/v1/analytics/trends
   * Get completion trends for the last N days
   */
  async getTrends(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const trends = await analyticsService.getCompletionTrends(req.user!.id, days);

      res.json({
        success: true,
        data: trends,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/analytics/priorities
   * Get priority distribution
   */
  async getPriorities(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const distribution = await analyticsService.getPriorityDistribution(req.user!.id);

      res.json({
        success: true,
        data: distribution,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/analytics/productivity
   * Get productivity metrics
   */
  async getProductivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const metrics = await analyticsService.getProductivityMetrics(req.user!.id);

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/analytics/insights
   * Get smart insights
   */
  async getInsights(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const insights = await analyticsService.getInsights(req.user!.id);

      res.json({
        success: true,
        data: insights,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/analytics/dashboard
   * Get all analytics data for dashboard
   */
  async getDashboardData(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const [trends, priorities, productivity, insights] = await Promise.all([
        analyticsService.getCompletionTrends(req.user!.id, 7),
        analyticsService.getPriorityDistribution(req.user!.id),
        analyticsService.getProductivityMetrics(req.user!.id),
        analyticsService.getInsights(req.user!.id),
      ]);

      res.json({
        success: true,
        data: {
          trends,
          priorities,
          productivity,
          insights,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
