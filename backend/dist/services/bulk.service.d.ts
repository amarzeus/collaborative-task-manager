/**
 * Bulk Operations Service
 * Handles bulk actions on tasks and users for admin operations
 */
import { Status, Priority } from '@prisma/client';
export type BulkAction = 'assign' | 'update_status' | 'update_priority' | 'delete' | 'archive';
export interface BulkTaskInput {
    action: BulkAction;
    taskIds: string[];
    data?: {
        assigneeId?: string;
        status?: Status;
        priority?: Priority;
    };
}
export interface BulkResult {
    success: boolean;
    processed: number;
    failed: number;
    errors: Array<{
        taskId: string;
        error: string;
    }>;
}
export declare const bulkService: {
    /**
     * Perform bulk operations on tasks
     */
    bulkTaskOperation(input: BulkTaskInput, actor: {
        id: string;
        email: string;
    }): Promise<BulkResult>;
    /**
     * Get task statistics for bulk operations
     */
    getBulkTaskPreview(taskIds: string[]): Promise<{
        total: number;
        found: number;
        missing: number;
        byStatus: Record<string, number>;
        byPriority: Record<string, number>;
        tasks: {
            id: string;
            status: import(".prisma/client").$Enums.Status;
            title: string;
            priority: import(".prisma/client").$Enums.Priority;
            assignedTo: {
                id: string;
                name: string;
            } | null;
        }[];
    }>;
};
//# sourceMappingURL=bulk.service.d.ts.map