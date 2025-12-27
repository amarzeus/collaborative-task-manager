/**
 * Custom hook for bulk task operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../lib/api';
import type { Status, Priority } from '../types';

const TASKS_QUERY_KEY = ['tasks'];

export interface BulkOperationResult {
    success: boolean;
    processed: number;
    failed: number;
    errors: Array<{ taskId: string; error: string }>;
}

/**
 * Hook to perform bulk status update on multiple tasks
 */
export function useBulkStatusUpdate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ taskIds, status }: { taskIds: string[]; status: Status }): Promise<BulkOperationResult> => {
            return taskApi.bulkUpdate({
                action: 'update_status',
                taskIds,
                data: { status },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
        },
    });
}

/**
 * Hook to perform bulk priority update on multiple tasks
 */
export function useBulkPriorityUpdate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ taskIds, priority }: { taskIds: string[]; priority: Priority }): Promise<BulkOperationResult> => {
            return taskApi.bulkUpdate({
                action: 'update_priority',
                taskIds,
                data: { priority },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
        },
    });
}

/**
 * Hook to perform bulk delete on multiple tasks
 * Note: Deletes tasks one by one using taskApi.delete
 */
export function useBulkDelete() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (taskIds: string[]): Promise<BulkOperationResult> => {
            const results: BulkOperationResult = {
                success: true,
                processed: 0,
                failed: 0,
                errors: [],
            };

            for (const taskId of taskIds) {
                try {
                    await taskApi.delete(taskId);
                    results.processed++;
                } catch (error) {
                    results.failed++;
                    results.errors.push({
                        taskId,
                        error: error instanceof Error ? error.message : 'Delete failed',
                    });
                }
            }
            return results;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
        },
    });
}

