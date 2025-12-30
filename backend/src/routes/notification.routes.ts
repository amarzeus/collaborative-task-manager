/**
 * Notification Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { notificationController } from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export const notificationRouter = Router();

// All notification routes require authentication
notificationRouter.use(authenticate);

notificationRouter.get('/', notificationController.getNotifications as any);
notificationRouter.put('/:id/read', notificationController.markAsRead as any);
notificationRouter.put('/read-all', notificationController.markAllAsRead as any);
