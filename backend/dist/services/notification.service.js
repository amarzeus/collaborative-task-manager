"use strict";
/**
 * Notification Service
 * Business logic for notification management
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const notification_repository_js_1 = require("../repositories/notification.repository.js");
exports.notificationService = {
    /**
     * Get notifications for a user
     */
    async getUserNotifications(userId) {
        const [notifications, unreadCount] = await Promise.all([
            notification_repository_js_1.notificationRepository.findByUserId(userId),
            notification_repository_js_1.notificationRepository.countUnread(userId),
        ]);
        return { notifications, unreadCount };
    },
    /**
     * Mark a notification as read
     */
    async markAsRead(id) {
        return notification_repository_js_1.notificationRepository.markAsRead(id);
    },
    /**
     * Mark all notifications as read
     */
    async markAllAsRead(userId) {
        return notification_repository_js_1.notificationRepository.markAllAsRead(userId);
    },
};
//# sourceMappingURL=notification.service.js.map