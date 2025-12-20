"use strict";
/**
 * Admin Controller
 * Handles admin-specific HTTP requests for user management
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = void 0;
const admin_service_js_1 = require("../services/admin.service.js");
const audit_service_js_1 = require("../services/audit.service.js");
const bulk_service_js_1 = require("../services/bulk.service.js");
exports.adminController = {
    /**
     * GET /api/v1/admin/users
     * List all users with optional filtering and pagination
     */
    async listUsers(req, res, next) {
        try {
            const query = req.query;
            const result = await admin_service_js_1.adminService.listUsers(query);
            res.json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/v1/admin/users/:id
     * Get a single user by ID
     */
    async getUserById(req, res, next) {
        try {
            const { id } = req.params;
            const user = await admin_service_js_1.adminService.getUserById(id);
            res.json({ success: true, data: user });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * POST /api/v1/admin/users
     * Create a new user
     */
    async createUser(req, res, next) {
        try {
            const data = req.body;
            const user = await admin_service_js_1.adminService.createUser(data, req.user.id);
            // Audit log
            await audit_service_js_1.auditService.logUserAction('CREATE', user, { id: req.user.id, email: req.user.email });
            res.status(201).json({ success: true, data: user });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * PUT /api/v1/admin/users/:id
     * Update a user
     */
    async updateUser(req, res, next) {
        try {
            const { id } = req.params;
            const data = req.body;
            const user = await admin_service_js_1.adminService.updateUser(id, data, req.user.id);
            // Audit log
            await audit_service_js_1.auditService.logUserAction('UPDATE', user, { id: req.user.id, email: req.user.email }, { changes: data });
            res.json({ success: true, data: user });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * POST /api/v1/admin/users/:id/suspend
     * Suspend a user account
     */
    async suspendUser(req, res, next) {
        try {
            const { id } = req.params;
            const result = await admin_service_js_1.adminService.suspendUser(id, req.user.id);
            // Audit log
            await audit_service_js_1.auditService.logUserAction('SUSPEND', { id }, { id: req.user.id, email: req.user.email });
            res.json({ success: true, message: result.message });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * POST /api/v1/admin/users/:id/activate
     * Activate a suspended user account
     */
    async activateUser(req, res, next) {
        try {
            const { id } = req.params;
            const result = await admin_service_js_1.adminService.activateUser(id);
            // Audit log
            await audit_service_js_1.auditService.logUserAction('ACTIVATE', { id }, { id: req.user.id, email: req.user.email });
            res.json({ success: true, message: result.message });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/v1/admin/stats
     * Get admin dashboard statistics
     */
    async getStats(_req, res, next) {
        try {
            const stats = await admin_service_js_1.adminService.getStats();
            res.json({ success: true, data: stats });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * POST /api/v1/admin/tasks/bulk
     * Bulk operations on tasks
     */
    async bulkTaskOperation(req, res, next) {
        try {
            const input = req.body;
            const result = await bulk_service_js_1.bulkService.bulkTaskOperation(input, {
                id: req.user.id,
                email: req.user.email,
            });
            res.json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * POST /api/v1/admin/tasks/bulk/preview
     * Preview bulk operation before executing
     */
    async bulkTaskPreview(req, res, next) {
        try {
            const { taskIds } = req.body;
            const preview = await bulk_service_js_1.bulkService.getBulkTaskPreview(taskIds);
            res.json({ success: true, data: preview });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/v1/admin/audit-logs
     * Get audit logs with filtering
     */
    async getAuditLogs(req, res, next) {
        try {
            const filters = req.query;
            const result = await audit_service_js_1.auditService.getLogs({
                ...filters,
                page: filters.page ? parseInt(filters.page) : undefined,
                limit: filters.limit ? parseInt(filters.limit) : undefined,
            });
            res.json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/v1/admin/audit-logs/:entityType/:entityId
     * Get audit history for a specific entity
     */
    async getEntityAuditHistory(req, res, next) {
        try {
            const { entityType, entityId } = req.params;
            const logs = await audit_service_js_1.auditService.getEntityHistory(entityType, entityId);
            res.json({ success: true, data: logs });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=admin.controller.js.map