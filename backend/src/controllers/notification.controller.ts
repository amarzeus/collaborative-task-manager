/**
 * Notification Controller
 * Handles HTTP requests for notifications
 */

import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service.js';

export const notificationController = {
  /**
   * GET /api/v1/notifications
   * Get notifications for current user
   */
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await notificationService.getUserNotifications((req as any).user!.id);
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
  async markAsRead(req: Request, res: Response, next: NextFunction) {
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
  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllAsRead((req as any).user!.id);
      res.json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  },
};
