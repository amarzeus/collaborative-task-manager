/**
 * Task Service
 * Business logic for task management
 */
import { taskRepository } from '../repositories/task.repository.js';
import type { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from '../dtos/index.js';
export interface TaskServiceResponse {
    task: Awaited<ReturnType<typeof taskRepository.findById>>;
    sendNotificationTo?: string;
}
export declare const taskService: {
    /**
     * Get all tasks with optional filtering
     */
    getTasks(query: TaskQueryDto, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.Status;
        title: string;
        description: string;
        dueDate: Date;
        priority: import(".prisma/client").$Enums.Priority;
        assignedToId: string | null;
        creatorId: string;
        creator: {
            id: string;
            email: string;
            name: string;
        };
        assignedTo: {
            id: string;
            email: string;
            name: string;
        } | null;
    }[]>;
    /**
     * Get a single task by ID
     */
    getTaskById(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.Status;
        title: string;
        description: string;
        dueDate: Date;
        priority: import(".prisma/client").$Enums.Priority;
        assignedToId: string | null;
        creatorId: string;
        creator: {
            id: string;
            email: string;
            name: string;
        };
        assignedTo: {
            id: string;
            email: string;
            name: string;
        } | null;
    }>;
    /**
     * Create a new task
     * @returns Task and notification target (if assigned)
     */
    createTask(data: CreateTaskDto, creatorId: string): Promise<TaskServiceResponse>;
    /**
     * Update a task
     * @returns Updated task and notification target (if assignee changed)
     */
    updateTask(id: string, data: UpdateTaskDto, userId: string): Promise<TaskServiceResponse>;
    /**
     * Delete a task
     * Only the creator can delete their task
     */
    deleteTask(id: string, userId: string): Promise<{
        success: boolean;
    }>;
};
//# sourceMappingURL=task.service.d.ts.map