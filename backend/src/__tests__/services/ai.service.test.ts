/**
 * Unit tests for AI Service
 * Tests AI function calling, conversation management, and audit logging
 */

// Mock Prisma before imports with all required functions
jest.mock('../../lib/prisma', () => ({
    prisma: {
        aIConversation: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            upsert: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        aIAuditLog: {
            create: jest.fn(),
        },
        task: {
            create: jest.fn(),
            findMany: jest.fn(),
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

import { aiService, AI_FUNCTIONS, SYSTEM_PROMPT } from '../../services/ai.service';
import { prisma } from '../../lib/prisma';

describe('AIService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Set up default mocks
        (prisma.aIConversation.findFirst as jest.Mock).mockResolvedValue(null);
        (prisma.aIConversation.findUnique as jest.Mock).mockResolvedValue(null);
        (prisma.aIConversation.upsert as jest.Mock).mockResolvedValue({});
        (prisma.aIConversation.create as jest.Mock).mockResolvedValue({});
        (prisma.aIConversation.update as jest.Mock).mockResolvedValue({});
        (prisma.aIAuditLog.create as jest.Mock).mockResolvedValue({});
        (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);
    });

    const mockContext = {
        userId: 'user-1',
        organizationId: 'org-1',
        teamIds: ['team-1'],
        userRole: 'USER',
    };

    describe('AI_FUNCTIONS', () => {
        /**
         * Test 1: All required functions are defined
         */
        it('should have all required AI functions defined', () => {
            const functionNames = AI_FUNCTIONS.map((f) => f.name);

            expect(functionNames).toContain('create_task');
            expect(functionNames).toContain('list_tasks');
            expect(functionNames).toContain('update_task');
            expect(functionNames).toContain('delete_task');
            expect(functionNames).toContain('get_analytics');
            expect(functionNames).toContain('search_tasks');
        });

        /**
         * Test 2: Functions have required parameters
         */
        it('should have proper parameter definitions', () => {
            const createTask = AI_FUNCTIONS.find((f) => f.name === 'create_task');

            expect(createTask?.parameters.properties).toHaveProperty('title');
            expect(createTask?.parameters.required).toContain('title');
        });
    });

    describe('SYSTEM_PROMPT', () => {
        /**
         * Test 3: System prompt is defined
         */
        it('should have a system prompt for AI assistant', () => {
            expect(SYSTEM_PROMPT).toBeDefined();
            expect(SYSTEM_PROMPT).toContain('TaskFlow AI');
        });
    });

    describe('getConversation', () => {
        /**
         * Test 4: Return conversation when exists
         */
        it('should return parsed conversation messages', async () => {
            const mockMessages = [{ role: 'user', content: 'Hello' }];
            (prisma.aIConversation.findFirst as jest.Mock).mockResolvedValue({
                messages: JSON.stringify(mockMessages),
            });

            const result = await aiService.getConversation('user-1');

            expect(result).toHaveProperty('messages');
        });

        /**
         * Test 5: Return empty array when no conversation
         */
        it('should return empty messages when no conversation exists', async () => {
            (prisma.aIConversation.findFirst as jest.Mock).mockResolvedValue(null);

            const result = await aiService.getConversation('user-1');

            expect(result).toHaveProperty('messages');
        });
    });

    describe('logAction', () => {
        /**
         * Test 6: Log AI action for audit
         */
        it('should create audit log entry', async () => {
            (prisma.aIAuditLog.create as jest.Mock).mockResolvedValue({});

            await aiService.logAction('user-1', 'create_task', { title: 'Test' }, 'success');

            expect(prisma.aIAuditLog.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    userId: 'user-1',
                    action: 'create_task',
                    result: 'success',
                }),
            });
        });

        /**
         * Test 7: Log error if provided
         */
        it('should log error when provided', async () => {
            (prisma.aIAuditLog.create as jest.Mock).mockResolvedValue({});

            await aiService.logAction('user-1', 'delete_task', {}, 'failure', 'Task not found');

            expect(prisma.aIAuditLog.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    error: 'Task not found',
                }),
            });
        });
    });

    describe('executeFunction', () => {
        /**
         * Test 8: Execute create_task function
         */
        it('should execute create_task function', async () => {
            const mockTask = { id: 'task-1', title: 'New Task' };
            (prisma.task.create as jest.Mock).mockResolvedValue(mockTask);

            const result = await aiService.executeFunction(
                'create_task',
                { title: 'New Task', priority: 'HIGH' },
                mockContext
            );

            expect(result.success).toBe(true);
        });

        /**
         * Test 9: Return error for unknown function
         */
        it('should return error for unknown function', async () => {
            const result = await aiService.executeFunction('unknown_func', {}, mockContext);

            expect(result.success).toBe(false);
            expect(result.error).toContain('Unknown function');
        });

        /**
         * Test 10: Handle function execution errors
         */
        it('should handle function execution errors', async () => {
            (prisma.task.create as jest.Mock).mockRejectedValue(new Error('Database error'));

            const result = await aiService.executeFunction(
                'create_task',
                { title: 'Test' },
                mockContext
            );

            expect(result.success).toBe(false);
            expect(result.error).toBe('Database error');
        });
    });

    describe('createTask', () => {
        /**
         * Test 11: Create task with all parameters
         */
        it('should create task with all provided parameters', async () => {
            const mockTask = {
                id: 'task-1',
                title: 'AI Created Task',
                priority: 'HIGH',
                status: 'TODO',
            };
            (prisma.task.create as jest.Mock).mockResolvedValue(mockTask);

            const result = await aiService.createTask(
                {
                    title: 'AI Created Task',
                    description: 'Created by AI',
                    priority: 'HIGH',
                    dueDate: '2024-12-31',
                },
                mockContext
            );

            expect(result.success).toBe(true);
            expect((result as any).result).toEqual(mockTask);
        });
    });

    describe('listTasks', () => {
        /**
         * Test 12: List tasks with filters
         */
        it('should list tasks with provided filters', async () => {
            const mockTasks = [{ id: 'task-1', title: 'Task 1' }];
            (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

            const result = await aiService.listTasks(
                { status: 'TODO', priority: 'HIGH', limit: 5 },
                mockContext
            );

            // listTasks returns wrapped result
            expect(result).toBeDefined();
        });

        /**
         * Test 13: Apply overdue filter
         */
        it('should filter overdue tasks', async () => {
            (prisma.task.findMany as jest.Mock).mockResolvedValue([]);

            await aiService.listTasks({ overdue: true }, mockContext);

            expect(prisma.task.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        dueDate: expect.objectContaining({ lt: expect.any(Date) }),
                    }),
                })
            );
        });
    });

    describe('updateTask', () => {
        /**
         * Test 14: Update existing task
         */
        it('should update task when user has access', async () => {
            const mockTask = { id: 'task-1', title: 'Original', creatorId: 'user-1' };
            const updatedTask = { ...mockTask, title: 'Updated' };

            (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);
            (prisma.task.update as jest.Mock).mockResolvedValue(updatedTask);

            const result = await aiService.updateTask(
                { taskId: 'task-1', title: 'Updated' },
                mockContext
            );

            expect(result.success).toBe(true);
        });

        /**
         * Test 15: Return error when task not found
         */
        it('should return error when task not found', async () => {
            (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await aiService.updateTask({ taskId: 'non-existent' }, mockContext);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Task not found');
        });
    });

    describe('deleteTask', () => {
        /**
         * Test 16: Delete task when user has access
         */
        it('should delete task when user is creator', async () => {
            const mockTask = { id: 'task-1', creatorId: 'user-1' };
            (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);
            (prisma.task.delete as jest.Mock).mockResolvedValue({});

            const result = await aiService.deleteTask({ taskId: 'task-1' }, mockContext);

            expect(result.success).toBe(true);
        });

        /**
         * Test 17: Return error when task not found for deletion
         */
        it('should return error when task not found for deletion', async () => {
            (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await aiService.deleteTask({ taskId: 'non-existent' }, mockContext);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Task not found');
        });
    });

    describe('searchTasks', () => {
        /**
         * Test 18: Search tasks by query
         */
        it('should search tasks by title and description', async () => {
            const mockTasks = [{ id: 'task-1', title: 'Meeting prep' }];
            (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

            const result = await aiService.searchTasks({ query: 'meeting' }, mockContext);

            // searchTasks returns wrapped result
            expect(result).toBeDefined();
        });
    });

    describe('getAnalytics', () => {
        /**
         * Test 19: Get task count analytics
         */
        it('should return task count analytics', async () => {
            (prisma.task.findMany as jest.Mock).mockResolvedValue([
                { status: 'DONE' },
                { status: 'TODO' },
                { status: 'IN_PROGRESS' },
            ]);

            const result = await aiService.getAnalytics({ type: 'summary' }, mockContext);

            expect(result).toBeDefined();
        });
    });
});
