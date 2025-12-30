import { Router } from 'express';
import { teamController } from '../controllers/team.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { tenantMiddleware, requireOrganization } from '../middleware/tenant.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import {
  createTeamSchema,
  updateTeamSchema,
  addTeamMemberSchema,
  updateTeamMemberSchema,
} from '../dtos/index.js';

const router = Router();

// All team routes require authentication AND organization context
router.use(authenticate);
router.use(tenantMiddleware);
router.use(requireOrganization);

router.get('/', teamController.list as any);
router.post('/', validateBody(createTeamSchema), teamController.create as any);
router.get('/:id', teamController.get as any);
router.put('/:id', validateBody(updateTeamSchema), teamController.update as any);
router.delete('/:id', teamController.delete as any);

// Membership routes
router.post('/:id/members', validateBody(addTeamMemberSchema), teamController.addMember as any);
router.delete('/:id/members/:userId', teamController.removeMember as any);
router.put(
  '/:id/members/:userId',
  validateBody(updateTeamMemberSchema),
  teamController.updateMemberRole as any
);

// Dashboard routes (Team Leaders only)
import { teamDashboardController } from '../controllers/team-dashboard.controller.js';
import { requireTeamLeader } from '../middleware/role.middleware.js';

router.get('/:id/dashboard', teamDashboardController.getOverview as any);
router.get('/:id/dashboard/members', teamDashboardController.getMemberPerformance as any);
router.get('/:id/dashboard/tasks', teamDashboardController.getTasks as any);
router.get('/:id/dashboard/trends', teamDashboardController.getTrends as any);
router.get(
  '/:id/dashboard/unassigned',
  requireTeamLeader() as any,
  teamDashboardController.getUnassignedTasks as any
);
router.post(
  '/:id/dashboard/assign',
  requireTeamLeader() as any,
  teamDashboardController.assignTask as any
);

export const teamRouter = router;
