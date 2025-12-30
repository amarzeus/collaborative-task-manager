/**
 * Unit tests for useTasks hook
 * Tests task CRUD operations with React Query
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useTask } from '../../hooks/useTasks';

// Mock the API and socket modules
vi.mock('../../lib/api', () => ({
    taskApi: {
        getAll: vi.fn(),
        getById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
}));

vi.mock('../../lib/socket', () => ({
    socketClient: {
        onTaskCreated: vi.fn(),
        onTaskUpdated: vi.fn(),
        onTaskDeleted: vi.fn(),
        offTaskCreated: vi.fn(),
        offTaskUpdated: vi.fn(),
        offTaskDeleted: vi.fn(),
    },
}));

import { taskApi } from '../../lib/api';

// Create a wrapper with QueryClientProvider
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });
    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

// Mock task data
const mockTasks = [
    { id: 'task-1', title: 'Task 1', status: 'TODO', priority: 'HIGH' },
    { id: 'task-2', title: 'Task 2', status: 'IN_PROGRESS', priority: 'MEDIUM' },
];

describe('useTasks Hooks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('useTasks', () => {
        /**
         * Test 1: Fetch all tasks successfully
         */
        it('should fetch all tasks', async () => {
            (taskApi.getAll as any).mockResolvedValue(mockTasks);

            const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockTasks);
            expect(taskApi.getAll).toHaveBeenCalled();
        });

        /**
         * Test 2: Fetch tasks with filters
         */
        it('should fetch tasks with filters', async () => {
            const filters = { status: 'TODO' as const };
            (taskApi.getAll as any).mockResolvedValue([mockTasks[0]]);

            const { result } = renderHook(() => useTasks(filters), { wrapper: createWrapper() });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(taskApi.getAll).toHaveBeenCalledWith(filters);
        });

        /**
         * Test 3: Handle loading state
         */
        it('should show loading state initially', async () => {
            (taskApi.getAll as any).mockImplementation(
                () => new Promise((resolve) => setTimeout(() => resolve(mockTasks), 100))
            );

            const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() });

            expect(result.current.isLoading).toBe(true);

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });
        });
    });

    describe('useTask', () => {
        /**
         * Test 4: Fetch single task by ID
         */
        it('should fetch single task by ID', async () => {
            (taskApi.getById as any).mockResolvedValue(mockTasks[0]);

            const { result } = renderHook(() => useTask('task-1'), { wrapper: createWrapper() });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockTasks[0]);
            expect(taskApi.getById).toHaveBeenCalledWith('task-1');
        });
    });

    describe('useCreateTask', () => {
        /**
         * Test 5: Create new task
         */
        it('should create a new task', async () => {
            const newTask = { title: 'New Task', description: 'Desc', priority: 'HIGH', dueDate: '2024-12-31' };
            const createdTask = { id: 'task-3', ...newTask };
            (taskApi.create as any).mockResolvedValue(createdTask);
            (taskApi.getAll as any).mockResolvedValue(mockTasks);

            const { result } = renderHook(() => useCreateTask(), { wrapper: createWrapper() });

            await act(async () => {
                result.current.mutate(newTask as any);
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(taskApi.create).toHaveBeenCalledWith(newTask);
        });
    });

    describe('useUpdateTask', () => {
        /**
         * Test 6: Update existing task
         */
        it('should update an existing task', async () => {
            const updateData = { title: 'Updated Title' };
            const updatedTask = { ...mockTasks[0], ...updateData };
            (taskApi.update as any).mockResolvedValue(updatedTask);
            (taskApi.getAll as any).mockResolvedValue(mockTasks);

            const { result } = renderHook(() => useUpdateTask(), { wrapper: createWrapper() });

            await act(async () => {
                result.current.mutate({ id: 'task-1', data: updateData });
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(taskApi.update).toHaveBeenCalledWith('task-1', updateData);
        });
    });

    describe('useDeleteTask', () => {
        /**
         * Test 7: Delete task
         */
        it('should delete a task', async () => {
            (taskApi.delete as any).mockResolvedValue({});
            (taskApi.getAll as any).mockResolvedValue(mockTasks);

            const { result } = renderHook(() => useDeleteTask(), { wrapper: createWrapper() });

            await act(async () => {
                result.current.mutate('task-1');
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(taskApi.delete).toHaveBeenCalledWith('task-1');
        });

        /**
         * Test 8: Handle delete error
         */
        it('should handle delete error', async () => {
            (taskApi.delete as any).mockRejectedValue(new Error('Delete failed'));
            (taskApi.getAll as any).mockResolvedValue(mockTasks);

            const { result } = renderHook(() => useDeleteTask(), { wrapper: createWrapper() });

            await act(async () => {
                result.current.mutate('task-1');
            });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.error?.message).toBe('Delete failed');
        });
    });
});
