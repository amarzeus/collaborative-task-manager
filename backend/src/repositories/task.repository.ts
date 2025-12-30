/**
 * Task Repository
 * Data access layer for Task entity
 */

import { Prisma, Priority, Status } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export interface CreateTaskData {
  title: string;
  description: string;
  dueDate: Date;
  priority: Priority;
  status: Status;
  creatorId: string;
  assignedToId?: string | null;
  organizationId?: string | null;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  dueDate?: Date;
  priority?: Priority;
  status?: Status;
  assignedToId?: string | null;
}

export interface TaskFilters {
  status?: Status;
  priority?: Priority;
  assignedToId?: string;
  creatorId?: string;
  overdue?: boolean;
  sortBy?: 'dueDate' | 'createdAt' | 'priority';
  sortOrder?: 'asc' | 'desc';
  organizationId?: string | null;
  // v2.0 Visibility filters
  userId?: string; // Current user for visibility check
  teamIds?: string[]; // Teams user belongs to for TEAM visibility
}

const taskSelect = {
  id: true,
  title: true,
  description: true,
  dueDate: true,
  priority: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  creatorId: true,
  assignedToId: true,
  visibility: true,
  organizationId: true,
  teamId: true,
  creator: {
    select: { id: true, name: true, email: true },
  },
  assignedTo: {
    select: { id: true, name: true, email: true },
  },
};

export const taskRepository = {
  /**
   * Find all tasks with optional filtering and sorting
   * v2.0: Added visibility-based access control
   */
  async findAll(filters: TaskFilters = {}) {
    const where: Prisma.TaskWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.assignedToId) {
      where.assignedToId = filters.assignedToId;
    }

    if (filters.creatorId) {
      where.creatorId = filters.creatorId;
    }

    if (filters.overdue) {
      where.dueDate = { lt: new Date() };
      where.status = { not: 'COMPLETED' };
    }

    // Filter by organization (or lack thereof for individual mode)
    if (filters.organizationId !== undefined) {
      where.organizationId = filters.organizationId;
    }

    // v2.0: Visibility-based access control
    // If userId is provided, apply visibility rules
    if (filters.userId) {
      const visibilityConditions: Prisma.TaskWhereInput[] = [
        // PRIVATE: Only creator can see
        { visibility: 'PRIVATE', creatorId: filters.userId },
        // ORGANIZATION: All org members can see (filtered by orgId above)
        { visibility: 'ORGANIZATION' },
      ];

      // TEAM: User must be in the team
      if (filters.teamIds && filters.teamIds.length > 0) {
        visibilityConditions.push({
          visibility: 'TEAM',
          teamId: { in: filters.teamIds },
        });
      }

      // Also include tasks assigned to the user (regardless of visibility)
      visibilityConditions.push({ assignedToId: filters.userId });

      where.OR = visibilityConditions;
    }

    // Build orderBy clause
    const orderBy: Prisma.TaskOrderByWithRelationInput = {};
    if (filters.sortBy === 'dueDate') {
      orderBy.dueDate = filters.sortOrder || 'asc';
    } else if (filters.sortBy === 'priority') {
      // Priority order: URGENT > HIGH > MEDIUM > LOW
      orderBy.priority = filters.sortOrder || 'desc';
    } else {
      orderBy.createdAt = filters.sortOrder || 'desc';
    }

    return prisma.task.findMany({
      where,
      select: taskSelect,
      orderBy,
    });
  },

  /**
   * Find task by ID
   */
  async findById(id: string) {
    return prisma.task.findUnique({
      where: { id },
      select: taskSelect,
    });
  },

  /**
   * Create a new task
   */
  async create(data: CreateTaskData) {
    const task = await prisma.task.create({
      data,
      select: taskSelect,
    });

    // Record creation history
    await prisma.taskHistory.create({
      data: {
        taskId: task.id,
        userId: data.creatorId,
        action: 'created',
      },
    });

    return task;
  },

  /**
   * Update a task
   */
  async update(id: string, data: UpdateTaskData, userId: string) {
    const existingTask = await prisma.task.findUnique({
      where: { id },
      select: { status: true, priority: true, assignedToId: true },
    });

    const task = await prisma.task.update({
      where: { id },
      data,
      select: taskSelect,
    });

    // Record history for status changes
    if (data.status && data.status !== existingTask?.status) {
      await prisma.taskHistory.create({
        data: {
          taskId: id,
          userId,
          action: 'status_changed',
          field: 'status',
          oldValue: existingTask?.status,
          newValue: data.status,
        },
      });
    }

    // Record history for assignments
    if (data.assignedToId !== undefined && data.assignedToId !== existingTask?.assignedToId) {
      await prisma.taskHistory.create({
        data: {
          taskId: id,
          userId,
          action: 'assigned',
          field: 'assignedToId',
          oldValue: existingTask?.assignedToId,
          newValue: data.assignedToId,
        },
      });
    }

    return task;
  },

  /**
   * Delete a task
   */
  async delete(id: string) {
    return prisma.task.delete({
      where: { id },
    });
  },

  /**
   * Check if task exists
   */
  async exists(id: string) {
    const task = await prisma.task.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!task;
  },
};
