/**
 * Notification Controller
 * Handles HTTP requests for notifications
 */
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
export declare const notificationController: {
    /**
     * GET /api/v1/notifications
     * Get notifications for current user
     */
    getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * PUT /api/v1/notifications/:id/read
     * Mark a notification as read
     */
    markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * PUT /api/v1/notifications/read-all
     * Mark all notifications as read
     */
    markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=notification.controller.d.ts.map