/**
 * Notification Routes
 */

import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export const notificationRouter = Router();

// All notification routes require authentication
notificationRouter.use(authenticate);

notificationRouter.get('/', notificationController.getNotifications);
notificationRouter.put('/:id/read', notificationController.markAsRead);
notificationRouter.put('/read-all', notificationController.markAllAsRead);
