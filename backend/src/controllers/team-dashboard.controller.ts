/**
 * Team Dashboard Controller
 * API endpoints for team analytics
 */

import { Request, Response, NextFunction } from 'express';
import { teamDashboardService } from '../services/team-dashboard.service.js';

export const teamDashboardController = {
    /**
     * GET /api/v1/teams/:id/dashboard
     * Get team dashboard overview
     */
    async getOverview(req: Request, res: Response, next: NextFunction) {
        try {
            const overview = await teamDashboardService.getTeamOverview(req.params.id);
            res.json({ success: true, data: overview });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/v1/teams/:id/dashboard/members
     * Get team member performance
     */
    async getMemberPerformance(req: Request, res: Response, next: NextFunction) {
        try {
            const members = await teamDashboardService.getMemberPerformance(req.params.id);
            res.json({ success: true, data: members });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/v1/teams/:id/dashboard/tasks
     * Get team tasks
     */
    async getTasks(req: Request, res: Response, next: NextFunction) {
        try {
            const { status } = req.query;
            const tasks = await teamDashboardService.getTeamTasks(
                req.params.id,
                status as string | undefined
            );
            res.json({ success: true, data: tasks });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/v1/teams/:id/dashboard/trends
     * Get team completion trends
     */
    async getTrends(req: Request, res: Response, next: NextFunction) {
        try {
            const days = parseInt(req.query.days as string) || 7;
            const trends = await teamDashboardService.getTeamTrends(req.params.id, days);
            res.json({ success: true, data: trends });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/v1/teams/:id/dashboard/unassigned
     * Get unassigned tasks for drag-to-assign
     */
    async getUnassignedTasks(req: Request, res: Response, next: NextFunction) {
        try {
            const tasks = await teamDashboardService.getUnassignedTasks(req.params.id);
            res.json({ success: true, data: tasks });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/v1/teams/:id/dashboard/assign
     * Assign task to team member
     */
    async assignTask(req: Request, res: Response, next: NextFunction) {
        try {
            const { taskId, assigneeId } = req.body;
            const task = await teamDashboardService.assignTask(
                taskId,
                assigneeId,
                (req as any).user!.id
            );
            res.json({ success: true, data: task });
        } catch (error) {
            next(error);
        }
    },
};
