/**
 * Notification Repository
 * Data access layer for Notification entity
 */
export interface CreateNotificationData {
    title: string;
    message: string;
    type: string;
    userId: string;
    taskId?: string;
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
        title: string;
        userId: string;
        read: boolean;
        taskId: string | null;
    }>;
    /**
     * Get notifications for a user
     */
    findByUserId(userId: string, limit?: number): Promise<({
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
    })[]>;
    /**
     * Mark notification as read
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
     * Mark all notifications as read for a user
     */
    markAllAsRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    /**
     * Count unread notifications for a user
     */
    countUnread(userId: string): Promise<number>;
};
//# sourceMappingURL=notification.repository.d.ts.map