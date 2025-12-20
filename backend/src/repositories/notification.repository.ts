/**
 * Notification Repository
 * Data access layer for Notification entity
 */

import { prisma } from '../lib/prisma.js';

export interface CreateNotificationData {
    title: string;
    message: string;
    type: string;
    userId: string;
    taskId?: string;
}

export const notificationRepository = {
    /**
     * Create a notification
     */
    async create(data: CreateNotificationData) {
        return prisma.notification.create({
            data,
        });
    },

    /**
     * Get notifications for a user
     */
    async findByUserId(userId: string, limit = 20) {
        return prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                task: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });
    },

    /**
     * Mark notification as read
     */
    async markAsRead(id: string) {
        return prisma.notification.update({
            where: { id },
            data: { read: true },
        });
    },

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId: string) {
        return prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
    },

    /**
     * Count unread notifications for a user
     */
    async countUnread(userId: string) {
        return prisma.notification.count({
            where: { userId, read: false },
        });
    },
};
