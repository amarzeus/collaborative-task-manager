"use strict";
/**
 * Unit tests for Task Service
 * Tests critical business logic for task management
 */
Object.defineProperty(exports, "__esModule", { value: true });
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
const task_service_1 = require("../../services/task.service");
const task_repository_1 = require("../../repositories/task.repository");
const user_repository_1 = require("../../repositories/user.repository");
const notification_repository_1 = require("../../repositories/notification.repository");
const errors_1 = require("../../lib/errors");
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
            priority: 'MEDIUM',
            status: 'TODO',
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
            task_repository_1.taskRepository.create.mockResolvedValue(mockTask);
            const result = await task_service_1.taskService.createTask({
                title: 'Test Task',
                description: 'Test description',
                dueDate: '2024-12-31T00:00:00.000Z',
                priority: 'MEDIUM',
                status: 'TODO',
            }, 'user-1');
            expect(result.task).toEqual(mockTask);
            expect(result.sendNotificationTo).toBeUndefined();
            expect(task_repository_1.taskRepository.create).toHaveBeenCalledWith({
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
            user_repository_1.userRepository.findById.mockResolvedValue({
                id: 'user-2',
                name: 'Assignee',
                email: 'assignee@example.com',
            });
            task_repository_1.taskRepository.create.mockResolvedValue(taskWithAssignee);
            notification_repository_1.notificationRepository.create.mockResolvedValue({});
            const result = await task_service_1.taskService.createTask({
                title: 'Test Task',
                description: 'Test description',
                dueDate: '2024-12-31T00:00:00.000Z',
                priority: 'MEDIUM',
                status: 'TODO',
                assignedToId: 'user-2',
            }, 'user-1');
            expect(result.task).toEqual(taskWithAssignee);
            expect(result.sendNotificationTo).toBe('user-2');
            expect(notification_repository_1.notificationRepository.create).toHaveBeenCalledWith({
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
            user_repository_1.userRepository.findById.mockResolvedValue(null);
            await expect(task_service_1.taskService.createTask({
                title: 'Test Task',
                description: 'Test description',
                dueDate: '2024-12-31T00:00:00.000Z',
                priority: 'MEDIUM',
                status: 'TODO',
                assignedToId: 'non-existent-user',
            }, 'user-1')).rejects.toThrow(errors_1.AppError);
        });
    });
    describe('getTaskById', () => {
        /**
         * Test 4: Return task when found
         */
        it('should return task when found', async () => {
            const mockTask = { id: 'task-1', title: 'Test' };
            task_repository_1.taskRepository.findById.mockResolvedValue(mockTask);
            const result = await task_service_1.taskService.getTaskById('task-1');
            expect(result).toEqual(mockTask);
        });
        /**
         * Test 5: Throw not found error when task doesn't exist
         */
        it('should throw not found error when task does not exist', async () => {
            task_repository_1.taskRepository.findById.mockResolvedValue(null);
            await expect(task_service_1.taskService.getTaskById('non-existent')).rejects.toThrow(errors_1.AppError);
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
            task_repository_1.taskRepository.findById.mockResolvedValue(mockTask);
            // Should fail for non-creator
            await expect(task_service_1.taskService.deleteTask('task-1', 'user-2')).rejects.toThrow(errors_1.AppError);
            // Should succeed for creator
            task_repository_1.taskRepository.delete.mockResolvedValue({});
            const result = await task_service_1.taskService.deleteTask('task-1', 'user-1');
            expect(result.success).toBe(true);
        });
    });
});
//# sourceMappingURL=task.service.test.js.map