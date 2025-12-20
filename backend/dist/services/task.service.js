"use strict";
/**
 * Task Service
 * Business logic for task management
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskService = void 0;
const task_repository_js_1 = require("../repositories/task.repository.js");
const notification_repository_js_1 = require("../repositories/notification.repository.js");
const user_repository_js_1 = require("../repositories/user.repository.js");
const errors_js_1 = require("../lib/errors.js");
exports.taskService = {
    /**
     * Get all tasks with optional filtering
     */
    async getTasks(query, userId) {
        const filters = {};
        if (query.status) {
            filters.status = query.status;
        }
        if (query.priority) {
            filters.priority = query.priority;
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
        return task_repository_js_1.taskRepository.findAll(filters);
    },
    /**
     * Get a single task by ID
     */
    async getTaskById(id) {
        const task = await task_repository_js_1.taskRepository.findById(id);
        if (!task) {
            throw errors_js_1.AppError.notFound('Task not found');
        }
        return task;
    },
    /**
     * Create a new task
     * @returns Task and notification target (if assigned)
     */
    async createTask(data, creatorId) {
        // Validate assignee exists if provided
        if (data.assignedToId) {
            const assignee = await user_repository_js_1.userRepository.findById(data.assignedToId);
            if (!assignee) {
                throw errors_js_1.AppError.badRequest('Assigned user not found');
            }
        }
        const task = await task_repository_js_1.taskRepository.create({
            title: data.title,
            description: data.description,
            dueDate: new Date(data.dueDate),
            priority: data.priority,
            status: data.status,
            creatorId,
            assignedToId: data.assignedToId || null,
        });
        // Create notification for assignee if different from creator
        let sendNotificationTo;
        if (data.assignedToId && data.assignedToId !== creatorId) {
            await notification_repository_js_1.notificationRepository.create({
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
    async updateTask(id, data, userId) {
        // Check task exists
        const existingTask = await task_repository_js_1.taskRepository.findById(id);
        if (!existingTask) {
            throw errors_js_1.AppError.notFound('Task not found');
        }
        // Validate new assignee exists if provided
        if (data.assignedToId) {
            const assignee = await user_repository_js_1.userRepository.findById(data.assignedToId);
            if (!assignee) {
                throw errors_js_1.AppError.badRequest('Assigned user not found');
            }
        }
        const updateData = {};
        if (data.title)
            updateData.title = data.title;
        if (data.description)
            updateData.description = data.description;
        if (data.dueDate)
            updateData.dueDate = new Date(data.dueDate);
        if (data.priority)
            updateData.priority = data.priority;
        if (data.status)
            updateData.status = data.status;
        if (data.assignedToId !== undefined)
            updateData.assignedToId = data.assignedToId;
        const task = await task_repository_js_1.taskRepository.update(id, updateData);
        // Create notification if assignee changed
        let sendNotificationTo;
        if (data.assignedToId &&
            data.assignedToId !== existingTask.assignedToId &&
            data.assignedToId !== userId) {
            await notification_repository_js_1.notificationRepository.create({
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
    async deleteTask(id, userId) {
        const task = await task_repository_js_1.taskRepository.findById(id);
        if (!task) {
            throw errors_js_1.AppError.notFound('Task not found');
        }
        // Only creator can delete
        if (task.creatorId !== userId) {
            throw errors_js_1.AppError.forbidden('Only the task creator can delete this task');
        }
        await task_repository_js_1.taskRepository.delete(id);
        return { success: true };
    },
};
//# sourceMappingURL=task.service.js.map