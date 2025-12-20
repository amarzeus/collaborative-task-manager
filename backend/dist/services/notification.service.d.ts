/**
 * Notification Service
 * Business logic for notification management
 */
export declare const notificationService: {
    /**
     * Get notifications for a user
     */
    getUserNotifications(userId: string): Promise<{
        notifications: ({
            task: {
                id: string;
                title: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            message: string;
            type: string;
            title: string;
            userId: string;
            read: boolean;
            taskId: string | null;
        })[];
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
        title: string;
        userId: string;
        read: boolean;
        taskId: string | null;
    }>;
    /**
     * Mark all notifications as read
     */
    markAllAsRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
};
//# sourceMappingURL=notification.service.d.ts.map