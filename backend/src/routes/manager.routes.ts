/**
 * Manager Dashboard Routes
 * Requires Manager or higher org role
 */

import { Router } from 'express';
import { managerDashboardController } from '../controllers/manager-dashboard.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { tenantMiddleware, requireOrganization } from '../middleware/tenant.middleware.js';
import { requireOrgManager } from '../middleware/role.middleware.js';

const router = Router();

// All manager routes require auth + org context + manager role
router.use(authenticate);
router.use(tenantMiddleware);
router.use(requireOrganization);
router.use(requireOrgManager() as any);

router.get('/dashboard', managerDashboardController.getOverview as any);
router.get('/dashboard/teams', managerDashboardController.getTeamComparison as any);
router.get('/dashboard/trends', managerDashboardController.getTrends as any);
router.get('/dashboard/performers', managerDashboardController.getTopPerformers as any);
router.get('/dashboard/priority', managerDashboardController.getPriorityDistribution as any);

export const managerRouter = router;
