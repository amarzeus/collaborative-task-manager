/**
 * Bulk Operations Service
 * Handles bulk actions on tasks and users for admin operations
 */

import { Prisma, Status, Priority } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';
import { auditService } from './audit.service.js';

export type BulkAction = 'assign' | 'update_status' | 'update_priority' | 'delete' | 'archive';

export interface BulkTaskInput {
  action: BulkAction;
  taskIds: string[];
  data?: {
    assigneeId?: string;
    status?: Status;
    priority?: Priority;
  };
}

export interface BulkResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: Array<{ taskId: string; error: string }>;
}

export const bulkService = {
  /**
   * Perform bulk operations on tasks
   */
  async bulkTaskOperation(
    input: BulkTaskInput,
    actor: { id: string; email: string }
  ): Promise<BulkResult> {
    const { action, taskIds, data } = input;
    const errors: Array<{ taskId: string; error: string }> = [];
    let processed = 0;

    // Validate tasks exist
    const existingTasks = await prisma.task.findMany({
      where: { id: { in: taskIds } },
      select: { id: true, status: true, priority: true, assignedToId: true },
    });

    const existingIds = new Set(existingTasks.map((t) => t.id));
    const missingIds = taskIds.filter((id) => !existingIds.has(id));
    missingIds.forEach((id) => errors.push({ taskId: id, error: 'Task not found' }));

    switch (action) {
      case 'assign':
        if (!data?.assigneeId) {
          throw AppError.badRequest('Assignee ID required for assign action');
        }
        // Validate assignee exists
        const assignee = await prisma.user.findUnique({
          where: { id: data.assigneeId },
          select: { id: true, name: true, isActive: true },
        });
        if (!assignee) {
          throw AppError.badRequest('Assignee not found');
        }
        if (!assignee.isActive) {
          throw AppError.badRequest('Cannot assign to suspended user');
        }

        // Bulk update
        const assignResult = await prisma.task.updateMany({
          where: { id: { in: Array.from(existingIds) } },
          data: { assignedToId: data.assigneeId },
        });
        processed = assignResult.count;

        // Log audit
        await auditService.log({
          entityType: 'Task',
          entityId: 'bulk',
          action: 'BULK_ASSIGN',
          actorId: actor.id,
          actorEmail: actor.email,
          metadata: {
            taskIds: Array.from(existingIds),
            assigneeId: data.assigneeId,
            assigneeName: assignee.name,
          },
        });
        break;

      case 'update_status':
        if (!data?.status) {
          throw AppError.badRequest('Status required for update_status action');
        }
        const statusResult = await prisma.task.updateMany({
          where: { id: { in: Array.from(existingIds) } },
          data: { status: data.status },
        });
        processed = statusResult.count;

        await auditService.log({
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
          throw AppError.badRequest('Priority required for update_priority action');
        }
        const priorityResult = await prisma.task.updateMany({
          where: { id: { in: Array.from(existingIds) } },
          data: { priority: data.priority },
        });
        processed = priorityResult.count;

        await auditService.log({
          entityType: 'Task',
          entityId: 'bulk',
          action: 'BULK_PRIORITY_UPDATE',
          actorId: actor.id,
          actorEmail: actor.email,
          metadata: { taskIds: Array.from(existingIds), newPriority: data.priority },
        });
        break;

      case 'delete':
        const deleteResult = await prisma.task.deleteMany({
          where: { id: { in: Array.from(existingIds) } },
        });
        processed = deleteResult.count;

        await auditService.log({
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
        const archiveResult = await prisma.task.updateMany({
          where: { id: { in: Array.from(existingIds) } },
          data: { status: 'COMPLETED' },
        });
        processed = archiveResult.count;

        await auditService.log({
          entityType: 'Task',
          entityId: 'bulk',
          action: 'BULK_ARCHIVE',
          actorId: actor.id,
          actorEmail: actor.email,
          metadata: { taskIds: Array.from(existingIds), count: processed },
        });
        break;

      default:
        throw AppError.badRequest(`Unknown action: ${action}`);
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
  async getBulkTaskPreview(taskIds: string[]) {
    const tasks = await prisma.task.findMany({
      where: { id: { in: taskIds } },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        assignedTo: { select: { id: true, name: true } },
      },
    });

    const statusCounts = tasks.reduce(
      (acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const priorityCounts = tasks.reduce(
      (acc, t) => {
        acc[t.priority] = (acc[t.priority] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

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
