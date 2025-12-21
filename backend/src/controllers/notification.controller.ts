/**
 * Notification Controller
 * Handles HTTP requests for notifications
 */

import { Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const notificationController = {
  /**
   * GET /api/v1/notifications
   * Get notifications for current user
   */
  async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await notificationService.getUserNotifications(req.user!.id);
      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/v1/notifications/:id/read
   * Mark a notification as read
   */
  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await notificationService.markAsRead(req.params.id);
      res.json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/v1/notifications/read-all
   * Mark all notifications as read
   */
  async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllAsRead(req.user!.id);
      res.json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  },
};
