/**
 * Analytics Controller
 * HTTP endpoints for analytics data
 */
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
export declare const analyticsController: {
    /**
     * GET /api/v1/analytics/trends
     * Get completion trends for the last N days
     */
    getTrends(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/v1/analytics/priorities
     * Get priority distribution
     */
    getPriorities(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/v1/analytics/productivity
     * Get productivity metrics
     */
    getProductivity(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/v1/analytics/insights
     * Get smart insights
     */
    getInsights(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/v1/analytics/dashboard
     * Get all analytics data for dashboard
     */
    getDashboardData(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=analytics.controller.d.ts.map