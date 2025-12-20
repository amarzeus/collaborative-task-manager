/**
 * Notification Service
 * Business logic for notification management
 */

import { notificationRepository } from '../repositories/notification.repository.js';

export const notificationService = {
    /**
     * Get notifications for a user
     */
    async getUserNotifications(userId: string) {
        const [notifications, unreadCount] = await Promise.all([
            notificationRepository.findByUserId(userId),
            notificationRepository.countUnread(userId),
        ]);

        return { notifications, unreadCount };
    },

    /**
     * Mark a notification as read
     */
    async markAsRead(id: string) {
        return notificationRepository.markAsRead(id);
    },

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(userId: string) {
        return notificationRepository.markAllAsRead(userId);
    },
};
