/**
 * Analytics Routes
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Analytics and insights endpoints
 */

import { Router, Request, Response, NextFunction } from 'express';
import { analyticsController } from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// All analytics routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /analytics/trends:
 *   get:
 *     tags: [Analytics]
 *     summary: Get task completion trends
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Trend data }
 */
router.get('/trends', analyticsController.getTrends as any);

/**
 * @swagger
 * /analytics/priorities:
 *   get:
 *     tags: [Analytics]
 *     summary: Get task priority distribution
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Priority breakdown }
 */
router.get('/priorities', analyticsController.getPriorities as any);

/**
 * @swagger
 * /analytics/productivity:
 *   get:
 *     tags: [Analytics]
 *     summary: Get productivity score
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Productivity metrics }
 */
router.get('/productivity', analyticsController.getProductivity as any);

/**
 * @swagger
 * /analytics/efficiency:
 *   get:
 *     tags: [Analytics]
 *     summary: Get task efficiency metrics
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Efficiency data }
 */
router.get('/efficiency', analyticsController.getEfficiency as any);

/**
 * @swagger
 * /analytics/heatmap:
 *   get:
 *     tags: [Analytics]
 *     summary: Get activity heatmap (90 days)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Heatmap data }
 */
router.get('/heatmap', analyticsController.getHeatmap as any);

/**
 * @swagger
 * /analytics/insights:
 *   get:
 *     tags: [Analytics]
 *     summary: Get AI-generated insights
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Smart insights }
 */
router.get('/insights', analyticsController.getInsights as any);

/**
 * @swagger
 * /analytics/dashboard:
 *   get:
 *     tags: [Analytics]
 *     summary: Get complete dashboard data
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Dashboard data }
 */
router.get('/dashboard', analyticsController.getDashboardData as any);

export default router;

