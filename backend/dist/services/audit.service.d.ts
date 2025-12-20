/**
 * Audit Service
 * Logs all admin and system actions for compliance and tracking
 */
export interface AuditLogInput {
    entityType: string;
    entityId: string;
    action: string;
    actorId: string;
    actorEmail: string;
    actorIp?: string;
    userAgent?: string;
    changes?: Record<string, {
        old: unknown;
        new: unknown;
    }>;
    metadata?: Record<string, unknown>;
}
export interface AuditLogFilters {
    entityType?: string;
    entityId?: string;
    actorId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}
export declare const auditService: {
    /**
     * Log an action to the audit trail
     */
    log(input: AuditLogInput): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        entityType: string;
        entityId: string;
        actorId: string;
        actorEmail: string;
        actorIp: string | null;
        userAgent: string | null;
        changes: string | null;
        metadata: string | null;
    }>;
    /**
     * Log user-related actions
     */
    logUserAction(action: string, targetUser: {
        id: string;
        email?: string;
        role?: string;
    }, actor: {
        id: string;
        email: string;
    }, options?: {
        ip?: string;
        userAgent?: string;
        changes?: Record<string, {
            old: unknown;
            new: unknown;
        }>;
    }): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        entityType: string;
        entityId: string;
        actorId: string;
        actorEmail: string;
        actorIp: string | null;
        userAgent: string | null;
        changes: string | null;
        metadata: string | null;
    }>;
    /**
     * Log task-related actions
     */
    logTaskAction(action: string, taskId: string, actor: {
        id: string;
        email: string;
    }, options?: {
        ip?: string;
        changes?: Record<string, {
            old: unknown;
            new: unknown;
        }>;
    }): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        entityType: string;
        entityId: string;
        actorId: string;
        actorEmail: string;
        actorIp: string | null;
        userAgent: string | null;
        changes: string | null;
        metadata: string | null;
    }>;
    /**
     * Get audit logs with filtering and pagination
     */
    getLogs(filters: AuditLogFilters): Promise<{
        logs: {
            changes: any;
            metadata: any;
            id: string;
            createdAt: Date;
            action: string;
            entityType: string;
            entityId: string;
            actorId: string;
            actorEmail: string;
            actorIp: string | null;
            userAgent: string | null;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    /**
     * Get recent activity for a specific entity
     */
    getEntityHistory(entityType: string, entityId: string, limit?: number): Promise<{
        changes: any;
        metadata: any;
        id: string;
        createdAt: Date;
        action: string;
        entityType: string;
        entityId: string;
        actorId: string;
        actorEmail: string;
        actorIp: string | null;
        userAgent: string | null;
    }[]>;
};
//# sourceMappingURL=audit.service.d.ts.map