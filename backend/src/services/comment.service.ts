/**
 * Comment Service
 * Business logic for task comments
 */

import { commentRepository } from '../repositories/comment.repository.js';
import { taskRepository } from '../repositories/task.repository.js';
import { notificationRepository } from '../repositories/notification.repository.js';
import { AppError } from '../lib/errors.js';
import type { CreateCommentInput, UpdateCommentInput } from '../dtos/comment.dto.js';

export const commentService = {
  /**
   * Get all comments for a task
   */
  async getCommentsByTaskId(taskId: string) {
    const taskExists = await taskRepository.exists(taskId);
    if (!taskExists) {
      throw AppError.notFound('Task not found');
    }
    return commentRepository.findByTaskId(taskId);
  },

  /**
   * Create a new comment
   */
  async createComment(data: CreateCommentInput, userId: string) {
    const task = await taskRepository.findById(data.taskId);
    if (!task) {
      throw AppError.notFound('Task not found');
    }

    const comment = await commentRepository.create({
      content: data.content,
      taskId: data.taskId,
      userId,
    });

    // Notify task assignee if different from commenter
    const notifyUserId = task.assignedToId || task.creatorId;
    if (notifyUserId && notifyUserId !== userId) {
      await notificationRepository.create({
        title: 'New Comment',
        message: `New comment on task "${task.title}": ${data.content.substring(0, 50)}${data.content.length > 50 ? '...' : ''}`,
        type: 'task_comment',
        userId: notifyUserId,
        taskId: task.id,
      });
    }

    return { comment, notifyUserId: notifyUserId !== userId ? notifyUserId : undefined };
  },

  /**
   * Update a comment
   */
  async updateComment(id: string, data: UpdateCommentInput, userId: string) {
    const comment = await commentRepository.findById(id);
    if (!comment) {
      throw AppError.notFound('Comment not found');
    }

    if (comment.userId !== userId) {
      throw AppError.forbidden('Only the author can edit this comment');
    }

    return commentRepository.update(id, data);
  },

  /**
   * Delete a comment
   */
  async deleteComment(id: string, userId: string) {
    const comment = await commentRepository.findById(id);
    if (!comment) {
      throw AppError.notFound('Comment not found');
    }

    if (comment.userId !== userId) {
      throw AppError.forbidden('Only the author can delete this comment');
    }

    await commentRepository.delete(id);
    return { success: true };
  },
};
