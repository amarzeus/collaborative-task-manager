/**
 * Analytics Routes
 * Routes for analytics and insights
 */

import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// All analytics routes require authentication
router.use(authenticate);

// Analytics endpoints
router.get('/trends', analyticsController.getTrends);
router.get('/priorities', analyticsController.getPriorities);
router.get('/productivity', analyticsController.getProductivity);
router.get('/efficiency', analyticsController.getEfficiency);
router.get('/heatmap', analyticsController.getHeatmap);
router.get('/insights', analyticsController.getInsights);
router.get('/dashboard', analyticsController.getDashboardData);

export default router;
