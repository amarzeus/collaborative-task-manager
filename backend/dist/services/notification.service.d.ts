/**
 * Notification Service
 * Business logic for notification management
 */
export declare const notificationService: {
    /**
     * Get notifications for a user
     */
    getUserNotifications(userId: string): Promise<{
        notifications: {
            id: string;
            createdAt: Date;
            message: string;
            type: string;
            userId: string;
            read: boolean;
        }[];
        unreadCount: number;
    }>;
    /**
     * Mark a notification as read
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
     * Mark all notifications as read
     */
    markAllAsRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
};
//# sourceMappingURL=notification.service.d.ts.map