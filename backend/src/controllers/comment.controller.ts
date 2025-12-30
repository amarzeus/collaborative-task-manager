/**
 * Comment Controller
 * Handles HTTP requests for task comments
 */

import { Request, Response, NextFunction } from 'express';
import { Server } from 'socket.io';
import { commentService } from '../services/comment.service.js';

export const commentController = {
  /**
   * GET /api/v1/tasks/:taskId/comments
   * Get all comments for a task
   */
  async getTaskComments(req: Request, res: Response, next: NextFunction) {
    try {
      const comments = await commentService.getCommentsByTaskId(req.params.taskId);
      res.json({
        success: true,
        data: comments,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/comments
   * Create a new comment
   */
  async createComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { comment, notifyUserId } = await commentService.createComment(
        req.body,
        (req as any).user!.id
      );

      // Emit real-time update
      const io: Server = req.app.get('io');
      io.emit('comment:created', comment);

      // Send notification if applicable
      if (notifyUserId) {
        io.to(`user:${notifyUserId}`).emit('notification:new', {
          title: 'New Comment',
          message: `New comment on task`,
          type: 'task_comment',
          taskId: comment.taskId,
        });
      }

      res.status(201).json({
        success: true,
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/v1/comments/:id
   * Update a comment
   */
  async updateComment(req: Request, res: Response, next: NextFunction) {
    try {
      const comment = await commentService.updateComment(
        req.params.id,
        req.body,
        (req as any).user!.id
      );

      // Emit real-time update
      const io: Server = req.app.get('io');
      io.emit('comment:updated', comment);

      res.json({
        success: true,
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/comments/:id
   * Delete a comment
   */
  async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      await commentService.deleteComment(req.params.id, (req as any).user!.id);

      // Emit real-time update
      const io: Server = req.app.get('io');
      io.emit('comment:deleted', { id: req.params.id, taskId: req.body.taskId });

      res.json({
        success: true,
        message: 'Comment deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};
