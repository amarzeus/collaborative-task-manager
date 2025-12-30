/**
 * Unit tests for Comment Service
 * Tests comment CRUD and notification logic
 */

// Mock repositories before imports
jest.mock('../../repositories/comment.repository', () => ({
  commentRepository: {
    findByTaskId: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../../repositories/task.repository', () => ({
  taskRepository: {
    exists: jest.fn(),
    findById: jest.fn(),
  },
}));

jest.mock('../../repositories/notification.repository', () => ({
  notificationRepository: {
    create: jest.fn(),
  },
}));

import { commentService } from '../../services/comment.service';
import { commentRepository } from '../../repositories/comment.repository';
import { taskRepository } from '../../repositories/task.repository';
import { notificationRepository } from '../../repositories/notification.repository';
import { AppError } from '../../lib/errors';

describe('CommentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockComment = {
    id: 'comment-1',
    content: 'Test comment',
    taskId: 'task-1',
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTask = {
    id: 'task-1',
    title: 'Test Task',
    creatorId: 'user-2',
    assignedToId: 'user-3',
  };

  describe('getCommentsByTaskId', () => {
    /**
     * Test 1: Return comments for task
     */
    it('should return all comments for a task', async () => {
      (taskRepository.exists as jest.Mock).mockResolvedValue(true);
      (commentRepository.findByTaskId as jest.Mock).mockResolvedValue([mockComment]);

      const result = await commentService.getCommentsByTaskId('task-1');

      expect(result).toEqual([mockComment]);
    });

    /**
     * Test 2: Throw 404 when task not found
     */
    it('should throw 404 when task does not exist', async () => {
      (taskRepository.exists as jest.Mock).mockResolvedValue(false);

      await expect(commentService.getCommentsByTaskId('non-existent')).rejects.toThrow(AppError);
    });
  });

  describe('createComment', () => {
    /**
     * Test 3: Create comment and return it
     */
    it('should create comment successfully', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue(mockTask);
      (commentRepository.create as jest.Mock).mockResolvedValue(mockComment);
      (notificationRepository.create as jest.Mock).mockResolvedValue({});

      const result = await commentService.createComment(
        { content: 'Test comment', taskId: 'task-1' },
        'user-1'
      );

      expect(result.comment).toEqual(mockComment);
    });

    /**
     * Test 4: Notify assignee on new comment
     */
    it('should notify assignee when comment is created', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue(mockTask);
      (commentRepository.create as jest.Mock).mockResolvedValue(mockComment);
      (notificationRepository.create as jest.Mock).mockResolvedValue({});

      const result = await commentService.createComment(
        { content: 'Test comment', taskId: 'task-1' },
        'user-1'
      );

      expect(notificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-3', // assignee
          type: 'task_comment',
        })
      );
      expect(result.notifyUserId).toBe('user-3');
    });

    /**
     * Test 5: Do not notify self
     */
    it('should not notify when commenter is assignee', async () => {
      const taskWithSelfAssigned = { ...mockTask, assignedToId: 'user-1' };
      (taskRepository.findById as jest.Mock).mockResolvedValue(taskWithSelfAssigned);
      (commentRepository.create as jest.Mock).mockResolvedValue(mockComment);

      const result = await commentService.createComment(
        { content: 'Test comment', taskId: 'task-1' },
        'user-1'
      );

      expect(notificationRepository.create).not.toHaveBeenCalled();
      expect(result.notifyUserId).toBeUndefined();
    });

    /**
     * Test 6: Throw 404 when task not found
     */
    it('should throw 404 when task does not exist', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        commentService.createComment({ content: 'Test', taskId: 'non-existent' }, 'user-1')
      ).rejects.toThrow(AppError);
    });
  });

  describe('updateComment', () => {
    /**
     * Test 7: Update comment by author
     */
    it('should update comment when user is author', async () => {
      (commentRepository.findById as jest.Mock).mockResolvedValue(mockComment);
      (commentRepository.update as jest.Mock).mockResolvedValue({
        ...mockComment,
        content: 'Updated content',
      });

      const result = await commentService.updateComment(
        'comment-1',
        { content: 'Updated content' },
        'user-1'
      );

      expect(result.content).toBe('Updated content');
    });

    /**
     * Test 8: Throw 403 when non-author tries to update
     */
    it('should throw 403 when non-author tries to update', async () => {
      (commentRepository.findById as jest.Mock).mockResolvedValue(mockComment);

      await expect(
        commentService.updateComment('comment-1', { content: 'Hacked content' }, 'hacker')
      ).rejects.toThrow(AppError);
    });

    /**
     * Test 9: Throw 404 when comment not found
     */
    it('should throw 404 when comment does not exist', async () => {
      (commentRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        commentService.updateComment('non-existent', { content: 'Test' }, 'user-1')
      ).rejects.toThrow(AppError);
    });
  });

  describe('deleteComment', () => {
    /**
     * Test 10: Delete comment by author
     */
    it('should delete comment when user is author', async () => {
      (commentRepository.findById as jest.Mock).mockResolvedValue(mockComment);
      (commentRepository.delete as jest.Mock).mockResolvedValue({});

      const result = await commentService.deleteComment('comment-1', 'user-1');

      expect(result.success).toBe(true);
      expect(commentRepository.delete).toHaveBeenCalledWith('comment-1');
    });

    /**
     * Test 11: Throw 403 when non-author tries to delete
     */
    it('should throw 403 when non-author tries to delete', async () => {
      (commentRepository.findById as jest.Mock).mockResolvedValue(mockComment);

      await expect(commentService.deleteComment('comment-1', 'hacker')).rejects.toThrow(AppError);
    });

    /**
     * Test 12: Throw 404 when comment not found
     */
    it('should throw 404 when comment does not exist', async () => {
      (commentRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(commentService.deleteComment('non-existent', 'user-1')).rejects.toThrow(
        AppError
      );
    });
  });
});
