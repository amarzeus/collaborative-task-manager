"use strict";
/**
 * Task Repository
 * Data access layer for Task entity
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskRepository = void 0;
const prisma_js_1 = require("../lib/prisma.js");
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
exports.taskRepository = {
    /**
     * Find all tasks with optional filtering and sorting
     */
    async findAll(filters = {}) {
        const where = {};
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
        const orderBy = {};
        if (filters.sortBy === 'dueDate') {
            orderBy.dueDate = filters.sortOrder || 'asc';
        }
        else if (filters.sortBy === 'priority') {
            // Priority order: URGENT > HIGH > MEDIUM > LOW
            orderBy.priority = filters.sortOrder || 'desc';
        }
        else {
            orderBy.createdAt = filters.sortOrder || 'desc';
        }
        return prisma_js_1.prisma.task.findMany({
            where,
            select: taskSelect,
            orderBy,
        });
    },
    /**
     * Find task by ID
     */
    async findById(id) {
        return prisma_js_1.prisma.task.findUnique({
            where: { id },
            select: taskSelect,
        });
    },
    /**
     * Create a new task
     */
    async create(data) {
        return prisma_js_1.prisma.task.create({
            data,
            select: taskSelect,
        });
    },
    /**
     * Update a task
     */
    async update(id, data) {
        return prisma_js_1.prisma.task.update({
            where: { id },
            data,
            select: taskSelect,
        });
    },
    /**
     * Delete a task
     */
    async delete(id) {
        return prisma_js_1.prisma.task.delete({
            where: { id },
        });
    },
    /**
     * Check if task exists
     */
    async exists(id) {
        const task = await prisma_js_1.prisma.task.findUnique({
            where: { id },
            select: { id: true },
        });
        return !!task;
    },
};
//# sourceMappingURL=task.repository.js.map