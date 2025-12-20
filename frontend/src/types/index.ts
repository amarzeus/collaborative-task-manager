/**
 * TypeScript types for the application
 */

// User types
export interface User {
    id: string;
    email: string;
    name: string;
    createdAt?: string;
}

// Auth types
export interface AuthResponse {
    user: User;
    token: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials extends LoginCredentials {
    name: string;
}

// Task types
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type Status = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';

export interface Task {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    priority: Priority;
    status: Status;
    createdAt: string;
    updatedAt: string;
    creatorId: string;
    assignedToId: string | null;
    creator: {
        id: string;
        name: string;
        email: string;
    };
    assignedTo: {
        id: string;
        name: string;
        email: string;
    } | null;
}

export interface CreateTaskInput {
    title: string;
    description: string;
    dueDate: string;
    priority: Priority;
    status: Status;
    assignedToId?: string | null;
}

export interface UpdateTaskInput {
    title?: string;
    description?: string;
    dueDate?: string;
    priority?: Priority;
    status?: Status;
    assignedToId?: string | null;
}

export interface TaskFilters {
    status?: Status;
    priority?: Priority;
    assignedToMe?: boolean;
    createdByMe?: boolean;
    overdue?: boolean;
    sortBy?: 'dueDate' | 'createdAt' | 'priority';
    sortOrder?: 'asc' | 'desc';
}

// Notification types
export interface Notification {
    id: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: string;
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface ApiError {
    success: false;
    message: string;
    errors?: Array<{ field: string; message: string }>;
}
