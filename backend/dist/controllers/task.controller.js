"use strict";
/**
 * Task Controller
 * Handles HTTP requests for task management
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskController = void 0;
const task_service_js_1 = require("../services/task.service.js");
exports.taskController = {
    /**
     * GET /api/v1/tasks
     * Get all tasks with optional filtering
     */
    async getTasks(req, res, next) {
        try {
            const tasks = await task_service_js_1.taskService.getTasks(req.query, req.user.id);
            res.json({
                success: true,
                data: tasks,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/v1/tasks/:id
     * Get a single task by ID
     */
    async getTask(req, res, next) {
        try {
            const task = await task_service_js_1.taskService.getTaskById(req.params.id);
            res.json({
                success: true,
                data: task,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * POST /api/v1/tasks
     * Create a new task
     */
    async createTask(req, res, next) {
        try {
            const { task, sendNotificationTo } = await task_service_js_1.taskService.createTask(req.body, req.user.id);
            // Emit real-time update
            const io = req.app.get('io');
            io.emit('task:created', task);
            // Send notification to assignee
            if (sendNotificationTo) {
                io.to(`user:${sendNotificationTo}`).emit('notification:new', {
                    title: 'New Task Assignment',
                    message: `You have been assigned to task: ${task?.title}`,
                    type: 'task_assigned',
                    taskId: task?.id,
                });
            }
            res.status(201).json({
                success: true,
                data: task,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * PUT /api/v1/tasks/:id
     * Update a task
     */
    async updateTask(req, res, next) {
        try {
            const { task, sendNotificationTo } = await task_service_js_1.taskService.updateTask(req.params.id, req.body, req.user.id);
            // Emit real-time update
            const io = req.app.get('io');
            io.emit('task:updated', task);
            // Send notification to new assignee
            if (sendNotificationTo) {
                io.to(`user:${sendNotificationTo}`).emit('notification:new', {
                    title: 'Task Reassignment',
                    message: `You have been assigned to task: ${task?.title}`,
                    type: 'task_assigned',
                    taskId: task?.id,
                });
            }
            res.json({
                success: true,
                data: task,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * DELETE /api/v1/tasks/:id
     * Delete a task
     */
    async deleteTask(req, res, next) {
        try {
            await task_service_js_1.taskService.deleteTask(req.params.id, req.user.id);
            // Emit real-time update
            const io = req.app.get('io');
            io.emit('task:deleted', { id: req.params.id });
            res.json({
                success: true,
                message: 'Task deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=task.controller.js.map