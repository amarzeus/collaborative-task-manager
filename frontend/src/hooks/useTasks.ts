/**
 * Custom hooks for task operations with React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { taskApi } from '../lib/api';
import { socketClient } from '../lib/socket';
import type { Task, TaskFilters, CreateTaskInput, UpdateTaskInput } from '../types/index';

const TASKS_QUERY_KEY = ['tasks'];

/**
 * Hook to fetch all tasks with optional filters
 */
export function useTasks(filters?: TaskFilters) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: [...TASKS_QUERY_KEY, filters],
        queryFn: () => taskApi.getAll(filters),
        staleTime: 30000, // 30 seconds
    });

    // Set up real-time listeners
    useEffect(() => {
        const handleTaskCreated = (task: Task) => {
            queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
        };

        const handleTaskUpdated = (task: Task) => {
            queryClient.setQueryData<Task[]>([...TASKS_QUERY_KEY, filters], (old) => {
                if (!old) return old;
                return old.map((t) => (t.id === task.id ? task : t));
            });
        };

        const handleTaskDeleted = ({ id }: { id: string }) => {
            queryClient.setQueryData<Task[]>([...TASKS_QUERY_KEY, filters], (old) => {
                if (!old) return old;
                return old.filter((t) => t.id !== id);
            });
        };

        socketClient.onTaskCreated(handleTaskCreated);
        socketClient.onTaskUpdated(handleTaskUpdated);
        socketClient.onTaskDeleted(handleTaskDeleted);

        return () => {
            socketClient.offTaskCreated(handleTaskCreated);
            socketClient.offTaskUpdated(handleTaskUpdated);
            socketClient.offTaskDeleted(handleTaskDeleted);
        };
    }, [queryClient, filters]);

    return query;
}

/**
 * Hook to create a new task
 */
export function useCreateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTaskInput) => taskApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
        },
    });
}

/**
 * Hook to update a task
 */
export function useUpdateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateTaskInput }) =>
            taskApi.update(id, data),
        // Optimistic update
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });

            const previousTasks = queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY);

            queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (old) => {
                if (!old) return old;
                return old.map((task) =>
                    task.id === id ? { ...task, ...data } : task
                );
            });

            return { previousTasks };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(TASKS_QUERY_KEY, context.previousTasks);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
        },
    });
}

/**
 * Hook to delete a task
 */
export function useDeleteTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => taskApi.delete(id),
        // Optimistic delete
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });

            const previousTasks = queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY);

            queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (old) => {
                if (!old) return old;
                return old.filter((task) => task.id !== id);
            });

            return { previousTasks };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(TASKS_QUERY_KEY, context.previousTasks);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
        },
    });
}

/**
 * Hook to fetch a single task by ID
 */
export function useTask(id: string) {
    return useQuery({
        queryKey: ['task', id],
        queryFn: () => taskApi.getById(id),
        enabled: !!id,
    });
}
