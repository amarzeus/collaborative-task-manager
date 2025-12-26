/**
 * Unit tests for Task Service
 * Tests critical business logic for task management
 */

import { Priority, Status } from '@prisma/client';

// Mock the repositories
jest.mock('../../repositories/task.repository', () => ({
  taskRepository: {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../../repositories/user.repository', () => ({
  userRepository: {
    findById: jest.fn(),
  },
}));

jest.mock('../../repositories/notification.repository', () => ({
  notificationRepository: {
    create: jest.fn(),
  },
}));

import { taskService } from '../../services/task.service';
import { taskRepository } from '../../repositories/task.repository';
import { userRepository } from '../../repositories/user.repository';
import { notificationRepository } from '../../repositories/notification.repository';
import { AppError } from '../../lib/errors';

describe('TaskService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    const mockUser = { id: 'user-1', name: 'Test User', email: 'test@example.com' };
    const mockTask = {
      id: 'task-1',
      title: 'Test Task',
      description: 'Test description',
      dueDate: new Date('2024-12-31'),
      priority: 'MEDIUM' as Priority,
      status: 'TODO' as Status,
      creatorId: 'user-1',
      assignedToId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      creator: mockUser,
      assignedTo: null,
    };

    /**
     * Test 1: Successfully create a task without assignment
     */
    it('should create a task without assignment', async () => {
      (taskRepository.create as jest.Mock).mockResolvedValue(mockTask);

      const result = await taskService.createTask(
        {
          title: 'Test Task',
          description: 'Test description',
          dueDate: '2024-12-31T00:00:00.000Z',
          priority: 'MEDIUM',
          status: 'TODO',
        },
        'user-1'
      );

      expect(result.task).toEqual(mockTask);
      expect(result.sendNotificationTo).toBeUndefined();
      expect(taskRepository.create).toHaveBeenCalledWith({
        title: 'Test Task',
        description: 'Test description',
        dueDate: expect.any(Date),
        priority: 'MEDIUM',
        status: 'TODO',
        creatorId: 'user-1',
        assignedToId: null,
      });
    });

    /**
     * Test 2: Create a task with assignment and send notification
     */
    it('should create a task with assignment and send notification', async () => {
      const taskWithAssignee = {
        ...mockTask,
        assignedToId: 'user-2',
        assignedTo: { id: 'user-2', name: 'Assignee', email: 'assignee@example.com' },
      };

      (userRepository.findById as jest.Mock).mockResolvedValue({
        id: 'user-2',
        name: 'Assignee',
        email: 'assignee@example.com',
      });
      (taskRepository.create as jest.Mock).mockResolvedValue(taskWithAssignee);
      (notificationRepository.create as jest.Mock).mockResolvedValue({});

      const result = await taskService.createTask(
        {
          title: 'Test Task',
          description: 'Test description',
          dueDate: '2024-12-31T00:00:00.000Z',
          priority: 'MEDIUM',
          status: 'TODO',
          assignedToId: 'user-2',
        },
        'user-1'
      );

      expect(result.task).toEqual(taskWithAssignee);
      expect(result.sendNotificationTo).toBe('user-2');
      expect(notificationRepository.create).toHaveBeenCalledWith({
        title: 'New Task Assignment',
        message: 'You have been assigned to task: Test Task',
        type: 'task_assigned',
        userId: 'user-2',
        taskId: 'task-1',
      });
    });

    /**
     * Test 3: Throw error when assigned user doesn't exist
     */
    it('should throw error when assigned user does not exist', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        taskService.createTask(
          {
            title: 'Test Task',
            description: 'Test description',
            dueDate: '2024-12-31T00:00:00.000Z',
            priority: 'MEDIUM',
            status: 'TODO',
            assignedToId: 'non-existent-user',
          },
          'user-1'
        )
      ).rejects.toThrow(AppError);
    });
  });

  describe('getTaskById', () => {
    /**
     * Test 4: Return task when found
     */
    it('should return task when found', async () => {
      const mockTask = { id: 'task-1', title: 'Test' };
      (taskRepository.findById as jest.Mock).mockResolvedValue(mockTask);

      const result = await taskService.getTaskById('task-1');

      expect(result).toEqual(mockTask);
    });

    /**
     * Test 5: Throw not found error when task doesn't exist
     */
    it('should throw not found error when task does not exist', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(taskService.getTaskById('non-existent')).rejects.toThrow(AppError);
    });
  });

  describe('deleteTask', () => {
    /**
     * Test 6: Only creator can delete task
     */
    it('should only allow creator to delete task', async () => {
      const mockTask = {
        id: 'task-1',
        title: 'Test',
        creatorId: 'user-1',
      };
      (taskRepository.findById as jest.Mock).mockResolvedValue(mockTask);

      // Should fail for non-creator
      await expect(taskService.deleteTask('task-1', 'user-2')).rejects.toThrow(AppError);

      // Should succeed for creator
      (taskRepository.delete as jest.Mock).mockResolvedValue({});
      const result = await taskService.deleteTask('task-1', 'user-1');
      expect(result.success).toBe(true);
    });
  });

  describe('updateTask', () => {
    const mockExistingTask = {
      id: 'task-1',
      title: 'Original Task',
      description: 'Original description',
      assignedToId: 'user-2',
      creatorId: 'user-1',
    };

    /**
     * Test 7: Update task and send notification on reassignment
     */
    it('should send notification when task is reassigned to different user', async () => {
      const updatedTask = {
        ...mockExistingTask,
        assignedToId: 'user-3',
      };

      (taskRepository.findById as jest.Mock).mockResolvedValue(mockExistingTask);
      (userRepository.findById as jest.Mock).mockResolvedValue({ id: 'user-3', name: 'New Assignee' });
      (taskRepository.update as jest.Mock).mockResolvedValue(updatedTask);
      (notificationRepository.create as jest.Mock).mockResolvedValue({});

      const result = await taskService.updateTask(
        'task-1',
        { assignedToId: 'user-3' },
        'user-1'
      );

      expect(result.sendNotificationTo).toBe('user-3');
      expect(notificationRepository.create).toHaveBeenCalledWith({
        title: 'Task Reassignment',
        message: expect.stringContaining('Original Task'),
        type: 'task_assigned',
        userId: 'user-3',
        taskId: 'task-1',
      });
    });

    /**
     * Test 8: No notification when self-assigning
     */
    it('should not send notification when self-assigning task', async () => {
      const updatedTask = {
        ...mockExistingTask,
        assignedToId: 'user-1',
      };

      (taskRepository.findById as jest.Mock).mockResolvedValue(mockExistingTask);
      (userRepository.findById as jest.Mock).mockResolvedValue({ id: 'user-1', name: 'Creator' });
      (taskRepository.update as jest.Mock).mockResolvedValue(updatedTask);

      const result = await taskService.updateTask(
        'task-1',
        { assignedToId: 'user-1' },
        'user-1'
      );

      expect(result.sendNotificationTo).toBeUndefined();
      expect(notificationRepository.create).not.toHaveBeenCalled();
    });

    /**
     * Test 9: No notification when assignee unchanged
     */
    it('should not send notification when updating without changing assignee', async () => {
      const updatedTask = {
        ...mockExistingTask,
        title: 'Updated Title',
      };

      (taskRepository.findById as jest.Mock).mockResolvedValue(mockExistingTask);
      (taskRepository.update as jest.Mock).mockResolvedValue(updatedTask);

      const result = await taskService.updateTask(
        'task-1',
        { title: 'Updated Title' },
        'user-1'
      );

      expect(result.sendNotificationTo).toBeUndefined();
      expect(notificationRepository.create).not.toHaveBeenCalled();
    });

    /**
     * Test 10: Validate assignee exists before update
     */
    it('should throw error when new assignee does not exist', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue(mockExistingTask);
      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        taskService.updateTask('task-1', { assignedToId: 'non-existent' }, 'user-1')
      ).rejects.toThrow(AppError);

      expect(taskRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('getTasks', () => {
    /**
     * Test 11: Filter tasks by status
     */
    it('should filter tasks by status', async () => {
      (taskRepository.findAll as jest.Mock).mockResolvedValue([]);

      await taskService.getTasks({ status: 'TODO' }, 'user-1');

      expect(taskRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'TODO' })
      );
    });

    /**
     * Test 12: Filter tasks by priority
     */
    it('should filter tasks by priority', async () => {
      (taskRepository.findAll as jest.Mock).mockResolvedValue([]);

      await taskService.getTasks({ priority: 'HIGH' }, 'user-1');

      expect(taskRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ priority: 'HIGH' })
      );
    });

    /**
     * Test 13: Filter tasks assigned to current user
     */
    it('should filter tasks assigned to current user', async () => {
      (taskRepository.findAll as jest.Mock).mockResolvedValue([]);

      await taskService.getTasks({ assignedToMe: 'true' }, 'user-1');

      expect(taskRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ assignedToId: 'user-1' })
      );
    });

    /**
     * Test 14: Filter overdue tasks
     */
    it('should filter overdue tasks', async () => {
      (taskRepository.findAll as jest.Mock).mockResolvedValue([]);

      await taskService.getTasks({ overdue: 'true' }, 'user-1');

      expect(taskRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ overdue: true })
      );
    });

    /**
     * Test 15: Sort tasks by due date
     */
    it('should sort tasks by due date', async () => {
      (taskRepository.findAll as jest.Mock).mockResolvedValue([]);

      await taskService.getTasks({ sortBy: 'dueDate', sortOrder: 'asc' }, 'user-1');

      expect(taskRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ sortBy: 'dueDate', sortOrder: 'asc' })
      );
    });
  });
});
