/**
 * Admin Controller
 * Handles admin-specific HTTP requests for user management
 */
import { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
export declare const adminController: {
    /**
     * GET /api/v1/admin/users
     * List all users with optional filtering and pagination
     */
    listUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/v1/admin/users/:id
     * Get a single user by ID
     */
    getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /api/v1/admin/users
     * Create a new user
     */
    createUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * PUT /api/v1/admin/users/:id
     * Update a user
     */
    updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /api/v1/admin/users/:id/suspend
     * Suspend a user account
     */
    suspendUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /api/v1/admin/users/:id/activate
     * Activate a suspended user account
     */
    activateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/v1/admin/stats
     * Get admin dashboard statistics
     */
    getStats(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /api/v1/admin/tasks/bulk
     * Bulk operations on tasks
     */
    bulkTaskOperation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /api/v1/admin/tasks/bulk/preview
     * Preview bulk operation before executing
     */
    bulkTaskPreview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/v1/admin/audit-logs
     * Get audit logs with filtering
     */
    getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/v1/admin/audit-logs/:entityType/:entityId
     * Get audit history for a specific entity
     */
    getEntityAuditHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=admin.controller.d.ts.map