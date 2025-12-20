/**
 * Notification Repository
 * Data access layer for Notification entity
 */
export interface CreateNotificationData {
    message: string;
    type: string;
    userId: string;
}
export declare const notificationRepository: {
    /**
     * Create a notification
     */
    create(data: CreateNotificationData): Promise<{
        id: string;
        createdAt: Date;
        message: string;
        type: string;
        userId: string;
        read: boolean;
    }>;
    /**
     * Get notifications for a user
     */
    findByUserId(userId: string, limit?: number): Promise<{
        id: string;
        createdAt: Date;
        message: string;
        type: string;
        userId: string;
        read: boolean;
    }[]>;
    /**
     * Mark notification as read
     */
    markAsRead(id: string): Promise<{
        id: string;
        createdAt: Date;
        message: string;
        type: string;
        userId: string;
        read: boolean;
    }>;
    /**
     * Mark all notifications as read for a user
     */
    markAllAsRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    /**
     * Count unread notifications for a user
     */
    countUnread(userId: string): Promise<number>;
};
//# sourceMappingURL=notification.repository.d.ts.map