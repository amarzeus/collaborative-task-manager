"use strict";
/**
 * Bulk Operations Service
 * Handles bulk actions on tasks and users for admin operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkService = void 0;
const prisma_js_1 = require("../lib/prisma.js");
const errors_js_1 = require("../lib/errors.js");
const audit_service_js_1 = require("./audit.service.js");
exports.bulkService = {
    /**
     * Perform bulk operations on tasks
     */
    async bulkTaskOperation(input, actor) {
        const { action, taskIds, data } = input;
        const errors = [];
        let processed = 0;
        // Validate tasks exist
        const existingTasks = await prisma_js_1.prisma.task.findMany({
            where: { id: { in: taskIds } },
            select: { id: true, status: true, priority: true, assignedToId: true },
        });
        const existingIds = new Set(existingTasks.map(t => t.id));
        const missingIds = taskIds.filter(id => !existingIds.has(id));
        missingIds.forEach(id => errors.push({ taskId: id, error: 'Task not found' }));
        switch (action) {
            case 'assign':
                if (!data?.assigneeId) {
                    throw errors_js_1.AppError.badRequest('Assignee ID required for assign action');
                }
                // Validate assignee exists
                const assignee = await prisma_js_1.prisma.user.findUnique({
                    where: { id: data.assigneeId },
                    select: { id: true, name: true, isActive: true },
                });
                if (!assignee) {
                    throw errors_js_1.AppError.badRequest('Assignee not found');
                }
                if (!assignee.isActive) {
                    throw errors_js_1.AppError.badRequest('Cannot assign to suspended user');
                }
                // Bulk update
                const assignResult = await prisma_js_1.prisma.task.updateMany({
                    where: { id: { in: Array.from(existingIds) } },
                    data: { assignedToId: data.assigneeId },
                });
                processed = assignResult.count;
                // Log audit
                await audit_service_js_1.auditService.log({
                    entityType: 'Task',
                    entityId: 'bulk',
                    action: 'BULK_ASSIGN',
                    actorId: actor.id,
                    actorEmail: actor.email,
                    metadata: { taskIds: Array.from(existingIds), assigneeId: data.assigneeId, assigneeName: assignee.name },
                });
                break;
            case 'update_status':
                if (!data?.status) {
                    throw errors_js_1.AppError.badRequest('Status required for update_status action');
                }
                const statusResult = await prisma_js_1.prisma.task.updateMany({
                    where: { id: { in: Array.from(existingIds) } },
                    data: { status: data.status },
                });
                processed = statusResult.count;
                await audit_service_js_1.auditService.log({
                    entityType: 'Task',
                    entityId: 'bulk',
                    action: 'BULK_STATUS_UPDATE',
                    actorId: actor.id,
                    actorEmail: actor.email,
                    metadata: { taskIds: Array.from(existingIds), newStatus: data.status },
                });
                break;
            case 'update_priority':
                if (!data?.priority) {
                    throw errors_js_1.AppError.badRequest('Priority required for update_priority action');
                }
                const priorityResult = await prisma_js_1.prisma.task.updateMany({
                    where: { id: { in: Array.from(existingIds) } },
                    data: { priority: data.priority },
                });
                processed = priorityResult.count;
                await audit_service_js_1.auditService.log({
                    entityType: 'Task',
                    entityId: 'bulk',
                    action: 'BULK_PRIORITY_UPDATE',
                    actorId: actor.id,
                    actorEmail: actor.email,
                    metadata: { taskIds: Array.from(existingIds), newPriority: data.priority },
                });
                break;
            case 'delete':
                const deleteResult = await prisma_js_1.prisma.task.deleteMany({
                    where: { id: { in: Array.from(existingIds) } },
                });
                processed = deleteResult.count;
                await audit_service_js_1.auditService.log({
                    entityType: 'Task',
                    entityId: 'bulk',
                    action: 'BULK_DELETE',
                    actorId: actor.id,
                    actorEmail: actor.email,
                    metadata: { taskIds: Array.from(existingIds), count: processed },
                });
                break;
            case 'archive':
                // Mark as completed (archive)
                const archiveResult = await prisma_js_1.prisma.task.updateMany({
                    where: { id: { in: Array.from(existingIds) } },
                    data: { status: 'COMPLETED' },
                });
                processed = archiveResult.count;
                await audit_service_js_1.auditService.log({
                    entityType: 'Task',
                    entityId: 'bulk',
                    action: 'BULK_ARCHIVE',
                    actorId: actor.id,
                    actorEmail: actor.email,
                    metadata: { taskIds: Array.from(existingIds), count: processed },
                });
                break;
            default:
                throw errors_js_1.AppError.badRequest(`Unknown action: ${action}`);
        }
        return {
            success: errors.length === 0,
            processed,
            failed: errors.length,
            errors,
        };
    },
    /**
     * Get task statistics for bulk operations
     */
    async getBulkTaskPreview(taskIds) {
        const tasks = await prisma_js_1.prisma.task.findMany({
            where: { id: { in: taskIds } },
            select: {
                id: true,
                title: true,
                status: true,
                priority: true,
                assignedTo: { select: { id: true, name: true } },
            },
        });
        const statusCounts = tasks.reduce((acc, t) => {
            acc[t.status] = (acc[t.status] || 0) + 1;
            return acc;
        }, {});
        const priorityCounts = tasks.reduce((acc, t) => {
            acc[t.priority] = (acc[t.priority] || 0) + 1;
            return acc;
        }, {});
        return {
            total: tasks.length,
            found: tasks.length,
            missing: taskIds.length - tasks.length,
            byStatus: statusCounts,
            byPriority: priorityCounts,
            tasks: tasks.slice(0, 10), // Preview first 10
        };
    },
};
//# sourceMappingURL=bulk.service.js.map