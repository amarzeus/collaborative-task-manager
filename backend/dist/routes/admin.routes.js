"use strict";
/**
 * Admin Routes
 * Protected routes for admin user management
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_js_1 = require("../controllers/admin.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const role_middleware_js_1 = require("../middleware/role.middleware.js");
const validate_middleware_js_1 = require("../middleware/validate.middleware.js");
const index_js_1 = require("../dtos/index.js");
const router = (0, express_1.Router)();
// All admin routes require authentication and admin role
router.use(auth_middleware_js_1.authenticate);
router.use((0, role_middleware_js_1.requireAdmin)());
/**
 * @route   GET /api/v1/admin/stats
 * @desc    Get admin dashboard statistics
 * @access  Admin only
 */
router.get('/stats', admin_controller_js_1.adminController.getStats);
/**
 * @route   GET /api/v1/admin/users
 * @desc    List all users with filtering and pagination
 * @access  Admin only
 */
router.get('/users', (0, validate_middleware_js_1.validateQuery)(index_js_1.adminUserQuerySchema), admin_controller_js_1.adminController.listUsers);
/**
 * @route   GET /api/v1/admin/users/:id
 * @desc    Get a single user by ID
 * @access  Admin only
 */
router.get('/users/:id', admin_controller_js_1.adminController.getUserById);
/**
 * @route   POST /api/v1/admin/users
 * @desc    Create a new user
 * @access  Admin only
 */
router.post('/users', (0, validate_middleware_js_1.validateBody)(index_js_1.adminCreateUserSchema), admin_controller_js_1.adminController.createUser);
/**
 * @route   PUT /api/v1/admin/users/:id
 * @desc    Update a user
 * @access  Admin only
 */
router.put('/users/:id', (0, validate_middleware_js_1.validateBody)(index_js_1.adminUpdateUserSchema), admin_controller_js_1.adminController.updateUser);
/**
 * @route   POST /api/v1/admin/users/:id/suspend
 * @desc    Suspend a user account
 * @access  Admin only
 */
router.post('/users/:id/suspend', admin_controller_js_1.adminController.suspendUser);
/**
 * @route   POST /api/v1/admin/users/:id/activate
 * @desc    Activate a suspended user account
 * @access  Admin only
 */
router.post('/users/:id/activate', admin_controller_js_1.adminController.activateUser);
// ============== Bulk Task Operations ==============
/**
 * @route   POST /api/v1/admin/tasks/bulk
 * @desc    Perform bulk operations on tasks
 * @access  Admin only
 */
router.post('/tasks/bulk', admin_controller_js_1.adminController.bulkTaskOperation);
/**
 * @route   POST /api/v1/admin/tasks/bulk/preview
 * @desc    Preview bulk operation before executing
 * @access  Admin only
 */
router.post('/tasks/bulk/preview', admin_controller_js_1.adminController.bulkTaskPreview);
// ============== Audit Logs ==============
/**
 * @route   GET /api/v1/admin/audit-logs
 * @desc    Get audit logs with filtering and pagination
 * @access  Admin only
 */
router.get('/audit-logs', admin_controller_js_1.adminController.getAuditLogs);
/**
 * @route   GET /api/v1/admin/audit-logs/:entityType/:entityId
 * @desc    Get audit history for a specific entity
 * @access  Admin only
 */
router.get('/audit-logs/:entityType/:entityId', admin_controller_js_1.adminController.getEntityAuditHistory);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map