/**
 * Task Repository
 * Data access layer for Task entity
 */
import { Priority, Status } from '@prisma/client';
export interface CreateTaskData {
    title: string;
    description: string;
    dueDate: Date;
    priority: Priority;
    status: Status;
    creatorId: string;
    assignedToId?: string | null;
}
export interface UpdateTaskData {
    title?: string;
    description?: string;
    dueDate?: Date;
    priority?: Priority;
    status?: Status;
    assignedToId?: string | null;
}
export interface TaskFilters {
    status?: Status;
    priority?: Priority;
    assignedToId?: string;
    creatorId?: string;
    overdue?: boolean;
    sortBy?: 'dueDate' | 'createdAt' | 'priority';
    sortOrder?: 'asc' | 'desc';
}
export declare const taskRepository: {
    /**
     * Find all tasks with optional filtering and sorting
     */
    findAll(filters?: TaskFilters): Promise<{
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
     * Find task by ID
     */
    findById(id: string): Promise<{
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
    } | null>;
    /**
     * Create a new task
     */
    create(data: CreateTaskData): Promise<{
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
     * Update a task
     */
    update(id: string, data: UpdateTaskData): Promise<{
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
     * Delete a task
     */
    delete(id: string): Promise<{
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
    }>;
    /**
     * Check if task exists
     */
    exists(id: string): Promise<boolean>;
};
//# sourceMappingURL=task.repository.d.ts.map