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
    return prisma.task.create({
      data,
      select: taskSelect,
    });
  },

  /**
   * Update a task
   */
  async update(id: string, data: UpdateTaskData) {
    return prisma.task.update({
      where: { id },
      data,
      select: taskSelect,
    });
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
