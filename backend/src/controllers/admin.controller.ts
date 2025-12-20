/**
 * Admin Controller
 * Handles admin-specific HTTP requests for user management
 */

import { Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service.js';
import { auditService } from '../services/audit.service.js';
import { bulkService, type BulkTaskInput } from '../services/bulk.service.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import type { AdminCreateUserDto, AdminUpdateUserDto, AdminUserQueryDto } from '../dtos/index.js';

export const adminController = {
    /**
     * GET /api/v1/admin/users
     * List all users with optional filtering and pagination
     */
    async listUsers(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const query = req.query as unknown as AdminUserQueryDto;
            const result = await adminService.listUsers(query);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/v1/admin/users/:id
     * Get a single user by ID
     */
    async getUserById(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;
            const user = await adminService.getUserById(id);
            res.json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/v1/admin/users
     * Create a new user
     */
    async createUser(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const data = req.body as AdminCreateUserDto;
            const user = await adminService.createUser(data, req.user!.id);

            // Audit log
            await auditService.logUserAction('CREATE', user, { id: req.user!.id, email: req.user!.email });

            res.status(201).json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/v1/admin/users/:id
     * Update a user
     */
    async updateUser(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;
            const data = req.body as AdminUpdateUserDto;
            const user = await adminService.updateUser(id, data, req.user!.id);

            // Audit log
            await auditService.logUserAction('UPDATE', user, { id: req.user!.id, email: req.user!.email }, { changes: data as Record<string, { old: unknown; new: unknown }> });

            res.json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/v1/admin/users/:id/suspend
     * Suspend a user account
     */
    async suspendUser(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;
            const result = await adminService.suspendUser(id, req.user!.id);

            // Audit log
            await auditService.logUserAction('SUSPEND', { id }, { id: req.user!.id, email: req.user!.email });

            res.json({ success: true, message: result.message });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/v1/admin/users/:id/activate
     * Activate a suspended user account
     */
    async activateUser(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;
            const result = await adminService.activateUser(id);

            // Audit log
            await auditService.logUserAction('ACTIVATE', { id }, { id: req.user!.id, email: req.user!.email });

            res.json({ success: true, message: result.message });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/v1/admin/stats
     * Get admin dashboard statistics
     */
    async getStats(
        _req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const stats = await adminService.getStats();
            res.json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/v1/admin/tasks/bulk
     * Bulk operations on tasks
     */
    async bulkTaskOperation(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const input = req.body as BulkTaskInput;
            const result = await bulkService.bulkTaskOperation(input, {
                id: req.user!.id,
                email: req.user!.email,
            });
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/v1/admin/tasks/bulk/preview
     * Preview bulk operation before executing
     */
    async bulkTaskPreview(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { taskIds } = req.body as { taskIds: string[] };
            const preview = await bulkService.getBulkTaskPreview(taskIds);
            res.json({ success: true, data: preview });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/v1/admin/audit-logs
     * Get audit logs with filtering
     */
    async getAuditLogs(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const filters = req.query as {
                entityType?: string;
                entityId?: string;
                actorId?: string;
                action?: string;
                startDate?: string;
                endDate?: string;
                page?: string;
                limit?: string;
            };
            const result = await auditService.getLogs({
                ...filters,
                page: filters.page ? parseInt(filters.page) : undefined,
                limit: filters.limit ? parseInt(filters.limit) : undefined,
            });
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/v1/admin/audit-logs/:entityType/:entityId
     * Get audit history for a specific entity
     */
    async getEntityAuditHistory(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { entityType, entityId } = req.params;
            const logs = await auditService.getEntityHistory(entityType, entityId);
            res.json({ success: true, data: logs });
        } catch (error) {
            next(error);
        }
    },
};
