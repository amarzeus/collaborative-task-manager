/**
 * Task Controller
 * Handles HTTP requests for task management
 */

import { Response, NextFunction } from 'express';
import { Server } from 'socket.io';
import { taskService } from '../services/task.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const taskController = {
  /**
   * GET /api/v1/tasks
   * Get all tasks with optional filtering
   */
  async getTasks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tasks = await taskService.getTasks(req.query as any, req.user!.id);
      res.json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/tasks/:id
   * Get a single task by ID
   */
  async getTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.getTaskById(req.params.id);
      res.json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/tasks
   * Create a new task
   */
  async createTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { task, sendNotificationTo } = await taskService.createTask(req.body, req.user!.id);

      // Emit real-time update
      const io: Server = req.app.get('io');
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
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/v1/tasks/:id
   * Update a task
   */
  async updateTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { task, sendNotificationTo } = await taskService.updateTask(
        req.params.id,
        req.body,
        req.user!.id
      );

      // Emit real-time update
      const io: Server = req.app.get('io');
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
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/tasks/:id
   * Delete a task
   */
  async deleteTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await taskService.deleteTask(req.params.id, req.user!.id);

      // Emit real-time update
      const io: Server = req.app.get('io');
      io.emit('task:deleted', { id: req.params.id });

      res.json({
        success: true,
        message: 'Task deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};
