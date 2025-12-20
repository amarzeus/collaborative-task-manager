"use strict";
/**
 * Analytics Controller
 * HTTP endpoints for analytics data
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsController = void 0;
const analytics_service_js_1 = require("../services/analytics.service.js");
exports.analyticsController = {
    /**
     * GET /api/v1/analytics/trends
     * Get completion trends for the last N days
     */
    async getTrends(req, res, next) {
        try {
            const days = parseInt(req.query.days) || 7;
            const trends = await analytics_service_js_1.analyticsService.getCompletionTrends(req.user.id, days);
            res.json({
                success: true,
                data: trends,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/v1/analytics/priorities
     * Get priority distribution
     */
    async getPriorities(req, res, next) {
        try {
            const distribution = await analytics_service_js_1.analyticsService.getPriorityDistribution(req.user.id);
            res.json({
                success: true,
                data: distribution,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/v1/analytics/productivity
     * Get productivity metrics
     */
    async getProductivity(req, res, next) {
        try {
            const metrics = await analytics_service_js_1.analyticsService.getProductivityMetrics(req.user.id);
            res.json({
                success: true,
                data: metrics,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/v1/analytics/insights
     * Get smart insights
     */
    async getInsights(req, res, next) {
        try {
            const insights = await analytics_service_js_1.analyticsService.getInsights(req.user.id);
            res.json({
                success: true,
                data: insights,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/v1/analytics/dashboard
     * Get all analytics data for dashboard
     */
    async getDashboardData(req, res, next) {
        try {
            const [trends, priorities, productivity, insights] = await Promise.all([
                analytics_service_js_1.analyticsService.getCompletionTrends(req.user.id, 7),
                analytics_service_js_1.analyticsService.getPriorityDistribution(req.user.id),
                analytics_service_js_1.analyticsService.getProductivityMetrics(req.user.id),
                analytics_service_js_1.analyticsService.getInsights(req.user.id),
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
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=analytics.controller.js.map