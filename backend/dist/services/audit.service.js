"use strict";
/**
 * Audit Service
 * Logs all admin and system actions for compliance and tracking
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditService = void 0;
const prisma_js_1 = require("../lib/prisma.js");
exports.auditService = {
    /**
     * Log an action to the audit trail
     */
    async log(input) {
        return prisma_js_1.prisma.auditLog.create({
            data: {
                entityType: input.entityType,
                entityId: input.entityId,
                action: input.action,
                actorId: input.actorId,
                actorEmail: input.actorEmail,
                actorIp: input.actorIp,
                userAgent: input.userAgent,
                changes: input.changes ? JSON.stringify(input.changes) : null,
                metadata: input.metadata ? JSON.stringify(input.metadata) : null,
            },
        });
    },
    /**
     * Log user-related actions
     */
    async logUserAction(action, targetUser, actor, options) {
        return this.log({
            entityType: 'User',
            entityId: targetUser.id,
            action,
            actorId: actor.id,
            actorEmail: actor.email,
            actorIp: options?.ip,
            userAgent: options?.userAgent,
            changes: options?.changes,
            metadata: { targetEmail: targetUser.email, targetRole: targetUser.role },
        });
    },
    /**
     * Log task-related actions
     */
    async logTaskAction(action, taskId, actor, options) {
        return this.log({
            entityType: 'Task',
            entityId: taskId,
            action,
            actorId: actor.id,
            actorEmail: actor.email,
            actorIp: options?.ip,
            changes: options?.changes,
        });
    },
    /**
     * Get audit logs with filtering and pagination
     */
    async getLogs(filters) {
        const { entityType, entityId, actorId, action, startDate, endDate, page = 1, limit = 50 } = filters;
        const skip = (page - 1) * limit;
        const where = {};
        if (entityType)
            where.entityType = entityType;
        if (entityId)
            where.entityId = entityId;
        if (actorId)
            where.actorId = actorId;
        if (action)
            where.action = action;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = new Date(startDate);
            if (endDate)
                where.createdAt.lte = new Date(endDate);
        }
        const [logs, total] = await Promise.all([
            prisma_js_1.prisma.auditLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma_js_1.prisma.auditLog.count({ where }),
        ]);
        return {
            logs: logs.map(log => ({
                ...log,
                changes: log.changes ? JSON.parse(log.changes) : null,
                metadata: log.metadata ? JSON.parse(log.metadata) : null,
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    },
    /**
     * Get recent activity for a specific entity
     */
    async getEntityHistory(entityType, entityId, limit = 20) {
        const logs = await prisma_js_1.prisma.auditLog.findMany({
            where: { entityType, entityId },
            take: limit,
            orderBy: { createdAt: 'desc' },
        });
        return logs.map(log => ({
            ...log,
            changes: log.changes ? JSON.parse(log.changes) : null,
            metadata: log.metadata ? JSON.parse(log.metadata) : null,
        }));
    },
};
//# sourceMappingURL=audit.service.js.map