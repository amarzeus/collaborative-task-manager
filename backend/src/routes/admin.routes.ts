/**
 * Admin Routes
 * Protected routes for admin user management
 */

import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';
import { validateBody, validateQuery } from '../middleware/validate.middleware.js';
import {
  adminCreateUserSchema,
  adminUpdateUserSchema,
  adminUserQuerySchema,
} from '../dtos/index.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin());

/**
 * @route   GET /api/v1/admin/stats
 * @desc    Get admin dashboard statistics
 * @access  Admin only
 */
router.get('/stats', adminController.getStats);

/**
 * @route   GET /api/v1/admin/users
 * @desc    List all users with filtering and pagination
 * @access  Admin only
 */
router.get('/users', validateQuery(adminUserQuerySchema), adminController.listUsers);

/**
 * @route   GET /api/v1/admin/users/:id
 * @desc    Get a single user by ID
 * @access  Admin only
 */
router.get('/users/:id', adminController.getUserById);

/**
 * @route   POST /api/v1/admin/users
 * @desc    Create a new user
 * @access  Admin only
 */
router.post('/users', validateBody(adminCreateUserSchema), adminController.createUser);

/**
 * @route   PUT /api/v1/admin/users/:id
 * @desc    Update a user
 * @access  Admin only
 */
router.put('/users/:id', validateBody(adminUpdateUserSchema), adminController.updateUser);

/**
 * @route   POST /api/v1/admin/users/:id/suspend
 * @desc    Suspend a user account
 * @access  Admin only
 */
router.post('/users/:id/suspend', adminController.suspendUser);

/**
 * @route   POST /api/v1/admin/users/:id/activate
 * @desc    Activate a suspended user account
 * @access  Admin only
 */
router.post('/users/:id/activate', adminController.activateUser);

// ============== Bulk Task Operations ==============

/**
 * @route   POST /api/v1/admin/tasks/bulk
 * @desc    Perform bulk operations on tasks
 * @access  Admin only
 */
router.post('/tasks/bulk', adminController.bulkTaskOperation);

/**
 * @route   POST /api/v1/admin/tasks/bulk/preview
 * @desc    Preview bulk operation before executing
 * @access  Admin only
 */
router.post('/tasks/bulk/preview', adminController.bulkTaskPreview);

// ============== Audit Logs ==============

/**
 * @route   GET /api/v1/admin/audit-logs
 * @desc    Get audit logs with filtering and pagination
 * @access  Admin only
 */
router.get('/audit-logs', adminController.getAuditLogs);

/**
 * @route   GET /api/v1/admin/audit-logs/:entityType/:entityId
 * @desc    Get audit history for a specific entity
 * @access  Admin only
 */
router.get('/audit-logs/:entityType/:entityId', adminController.getEntityAuditHistory);

export default router;
