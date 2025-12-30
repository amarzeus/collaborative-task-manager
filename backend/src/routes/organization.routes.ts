import { Router } from 'express';
import { OrganizationController } from '../controllers/organization.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { tenantMiddleware } from '../middleware/tenant.middleware.js';

const router = Router();
const organizationController = new OrganizationController();

// All routes require authentication and tenant context check
router.use(authenticate);
router.use(tenantMiddleware);

// Create new organization
router.post('/', organizationController.create as any);

// Get user's organizations
router.get('/', organizationController.getMyOrganizations as any);

// Get organization details (requires membership)
router.get('/:id', organizationController.getById as any);

export default router;
