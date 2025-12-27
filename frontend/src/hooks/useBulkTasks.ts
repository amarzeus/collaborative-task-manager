/**
 * Custom hook for bulk task operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../lib/api';
import type { Status, Priority } from '../types';

const TASKS_QUERY_KEY = ['tasks'];

export interface BulkOperationInput {
    action: 'assign' | 'update_status' | 'update_priority' | 'delete' | 'archive';
    taskIds: string[];
    data?: {
        assigneeId?: string;
        status?: Status;
        priority?: Priority;
    };
}

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
            return adminApi.bulkTaskOperation({
                action: 'update_status',
                taskIds,
                data: { status },
            }) as unknown as BulkOperationResult;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
        },
    });
}

/**
 * Hook to perform bulk delete on multiple tasks
 */
export function useBulkDelete() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (taskIds: string[]): Promise<BulkOperationResult> => {
            return adminApi.bulkTaskOperation({
                action: 'delete',
                taskIds,
            }) as unknown as BulkOperationResult;
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
            return adminApi.bulkTaskOperation({
                action: 'update_priority',
                taskIds,
                data: { priority },
            }) as unknown as BulkOperationResult;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
        },
    });
}

/**
 * Hook to perform bulk assign on multiple tasks
 */
export function useBulkAssign() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ taskIds, assigneeId }: { taskIds: string[]; assigneeId: string }): Promise<BulkOperationResult> => {
            return adminApi.bulkTaskOperation({
                action: 'assign',
                taskIds,
                data: { assigneeId },
            }) as unknown as BulkOperationResult;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
        },
    });
}
