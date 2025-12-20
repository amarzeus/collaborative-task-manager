"use strict";
/**
 * Notification Repository
 * Data access layer for Notification entity
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRepository = void 0;
const prisma_js_1 = require("../lib/prisma.js");
exports.notificationRepository = {
    /**
     * Create a notification
     */
    async create(data) {
        return prisma_js_1.prisma.notification.create({
            data,
        });
    },
    /**
     * Get notifications for a user
     */
    async findByUserId(userId, limit = 20) {
        return prisma_js_1.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    },
    /**
     * Mark notification as read
     */
    async markAsRead(id) {
        return prisma_js_1.prisma.notification.update({
            where: { id },
            data: { read: true },
        });
    },
    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId) {
        return prisma_js_1.prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
    },
    /**
     * Count unread notifications for a user
     */
    async countUnread(userId) {
        return prisma_js_1.prisma.notification.count({
            where: { userId, read: false },
        });
    },
};
//# sourceMappingURL=notification.repository.js.map