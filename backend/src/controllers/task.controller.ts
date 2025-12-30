/**
 * Task Controller
 * Handles HTTP requests for task management
 */

import { Request, Response, NextFunction } from 'express';
import { Server } from 'socket.io';
import { taskService } from '../services/task.service.js';


export const taskController = {
  /**
   * GET /api/v1/tasks
   * Get all tasks with optional filtering
   */
  async getTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const tasks = await taskService.getTasks(
        req.query as any,
        (req as any).user!.id,
        (req as any).tenantScope?.organizationId || null
      );
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
  async getTask(req: Request, res: Response, next: NextFunction) {
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
  async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { task, sendNotificationTo } = await taskService.createTask(
        req.body,
        (req as any).user!.id,
        (req as any).tenantScope?.organizationId || null
      );

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
  async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { task, sendNotificationTo } = await taskService.updateTask(
        req.params.id,
        req.body,
        (req as any).user!.id
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
  async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      await taskService.deleteTask(req.params.id, (req as any).user!.id);

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

  /**
   * POST /api/v1/tasks/bulk
   * Bulk update tasks - allows users to update status/priority of multiple tasks
   */
  async bulkUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskIds, action, data } = req.body;
      const userId = (req as any).user!.id;

      const results = {
        success: true,
        processed: 0,
        failed: 0,
        errors: [] as Array<{ taskId: string; error: string }>,
      };

      // Map action to update data
      const updateData: Record<string, unknown> = {};
      if (action === 'update_status' && data?.status) {
        updateData.status = data.status;
      } else if (action === 'update_priority' && data?.priority) {
        updateData.priority = data.priority;
      }

      // Process each task
      for (const taskId of taskIds) {
        try {
          const { task } = await taskService.updateTask(taskId, updateData, userId);
          if (task) {
            results.processed++;
            // Emit real-time update
            const io: Server = req.app.get('io');
            io.emit('task:updated', task);
          }
        } catch (error) {
          results.failed++;
          results.errors.push({
            taskId,
            error: error instanceof Error ? error.message : 'Update failed',
          });
        }
      }

      res.json(results);
    } catch (error) {
      next(error);
    }
  },
};
