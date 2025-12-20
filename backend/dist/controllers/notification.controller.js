"use strict";
/**
 * Notification Controller
 * Handles HTTP requests for notifications
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = void 0;
const notification_service_js_1 = require("../services/notification.service.js");
exports.notificationController = {
    /**
     * GET /api/v1/notifications
     * Get notifications for current user
     */
    async getNotifications(req, res, next) {
        try {
            const data = await notification_service_js_1.notificationService.getUserNotifications(req.user.id);
            res.json({
                success: true,
                data,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * PUT /api/v1/notifications/:id/read
     * Mark a notification as read
     */
    async markAsRead(req, res, next) {
        try {
            await notification_service_js_1.notificationService.markAsRead(req.params.id);
            res.json({
                success: true,
                message: 'Notification marked as read',
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * PUT /api/v1/notifications/read-all
     * Mark all notifications as read
     */
    async markAllAsRead(req, res, next) {
        try {
            await notification_service_js_1.notificationService.markAllAsRead(req.user.id);
            res.json({
                success: true,
                message: 'All notifications marked as read',
            });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=notification.controller.js.map