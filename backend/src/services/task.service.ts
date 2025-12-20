/**
 * Task Service
 * Business logic for task management
 */

import { Priority, Status } from '@prisma/client';
import { taskRepository, TaskFilters } from '../repositories/task.repository.js';
import { notificationRepository } from '../repositories/notification.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { AppError } from '../lib/errors.js';
import type { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from '../dtos/index.js';

export interface TaskServiceResponse {
    task: Awaited<ReturnType<typeof taskRepository.findById>>;
    sendNotificationTo?: string;
}

export const taskService = {
    /**
     * Get all tasks with optional filtering
     */
    async getTasks(query: TaskQueryDto, userId: string) {
        const filters: TaskFilters = {};

        if (query.status) {
            filters.status = query.status as Status;
        }

        if (query.priority) {
            filters.priority = query.priority as Priority;
        }

        if (query.assignedToMe === 'true') {
            filters.assignedToId = userId;
        }

        if (query.createdByMe === 'true') {
            filters.creatorId = userId;
        }

        if (query.overdue === 'true') {
            filters.overdue = true;
        }

        if (query.sortBy) {
            filters.sortBy = query.sortBy;
        }

        if (query.sortOrder) {
            filters.sortOrder = query.sortOrder;
        }

        return taskRepository.findAll(filters);
    },

    /**
     * Get a single task by ID
     */
    async getTaskById(id: string) {
        const task = await taskRepository.findById(id);
        if (!task) {
            throw AppError.notFound('Task not found');
        }
        return task;
    },

    /**
     * Create a new task
     * @returns Task and notification target (if assigned)
     */
    async createTask(data: CreateTaskDto, creatorId: string): Promise<TaskServiceResponse> {
        // Validate assignee exists if provided
        if (data.assignedToId) {
            const assignee = await userRepository.findById(data.assignedToId);
            if (!assignee) {
                throw AppError.badRequest('Assigned user not found');
            }
        }

        const task = await taskRepository.create({
            title: data.title,
            description: data.description,
            dueDate: new Date(data.dueDate),
            priority: data.priority as Priority,
            status: data.status as Status,
            creatorId,
            assignedToId: data.assignedToId || null,
        });

        // Create notification for assignee if different from creator
        let sendNotificationTo: string | undefined;
        if (data.assignedToId && data.assignedToId !== creatorId) {
            await notificationRepository.create({
                message: `You have been assigned to task: ${data.title}`,
                type: 'ASSIGNMENT',
                userId: data.assignedToId,
            });
            sendNotificationTo = data.assignedToId;
        }

        return { task, sendNotificationTo };
    },

    /**
     * Update a task
     * @returns Updated task and notification target (if assignee changed)
     */
    async updateTask(id: string, data: UpdateTaskDto, userId: string): Promise<TaskServiceResponse> {
        // Check task exists
        const existingTask = await taskRepository.findById(id);
        if (!existingTask) {
            throw AppError.notFound('Task not found');
        }

        // Validate new assignee exists if provided
        if (data.assignedToId) {
            const assignee = await userRepository.findById(data.assignedToId);
            if (!assignee) {
                throw AppError.badRequest('Assigned user not found');
            }
        }

        const updateData: Parameters<typeof taskRepository.update>[1] = {};

        if (data.title) updateData.title = data.title;
        if (data.description) updateData.description = data.description;
        if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
        if (data.priority) updateData.priority = data.priority as Priority;
        if (data.status) updateData.status = data.status as Status;
        if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId;

        const task = await taskRepository.update(id, updateData);

        // Create notification if assignee changed
        let sendNotificationTo: string | undefined;
        if (
            data.assignedToId &&
            data.assignedToId !== existingTask.assignedToId &&
            data.assignedToId !== userId
        ) {
            await notificationRepository.create({
                message: `You have been assigned to task: ${task?.title}`,
                type: 'ASSIGNMENT',
                userId: data.assignedToId,
            });
            sendNotificationTo = data.assignedToId;
        }

        return { task, sendNotificationTo };
    },

    /**
     * Delete a task
     * Only the creator can delete their task
     */
    async deleteTask(id: string, userId: string) {
        const task = await taskRepository.findById(id);
        if (!task) {
            throw AppError.notFound('Task not found');
        }

        // Only creator can delete
        if (task.creatorId !== userId) {
            throw AppError.forbidden('Only the task creator can delete this task');
        }

        await taskRepository.delete(id);
        return { success: true };
    },
};
