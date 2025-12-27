/**
 * API client for backend communication
 */

import axios, { AxiosError } from 'axios';
import type {
    ApiResponse,
    AuthResponse,
    LoginCredentials,
    RegisterCredentials,
    User,
    Task,
    CreateTaskInput,
    UpdateTaskInput,
    TaskFilters,
    Notification,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if stored in localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ message: string }>) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Redirect to login if not already there
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    register: async (data: RegisterCredentials): Promise<AuthResponse> => {
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
        return response.data.data;
    },

    login: async (data: LoginCredentials): Promise<AuthResponse> => {
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
        return response.data.data;
    },

    logout: async (): Promise<void> => {
        await api.post('/auth/logout');
    },

    getMe: async (): Promise<User> => {
        const response = await api.get<ApiResponse<User>>('/auth/me');
        return response.data.data;
    },

    updateProfile: async (data: { name?: string; email?: string }): Promise<User> => {
        const response = await api.put<ApiResponse<User>>('/auth/profile', data);
        return response.data.data;
    },

    changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
        await api.put('/auth/password', data);
    },

    deleteAccount: async (password: string): Promise<void> => {
        await api.delete('/auth/account', { data: { password } });
    },
};

// Task API
export const taskApi = {
    getAll: async (filters?: TaskFilters): Promise<Task[]> => {
        const params = new URLSearchParams();
        if (filters) {
            if (filters.status) params.set('status', filters.status);
            if (filters.priority) params.set('priority', filters.priority);
            if (filters.assignedToMe) params.set('assignedToMe', 'true');
            if (filters.createdByMe) params.set('createdByMe', 'true');
            if (filters.overdue) params.set('overdue', 'true');
            if (filters.sortBy) params.set('sortBy', filters.sortBy);
            if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
        }
        const response = await api.get<ApiResponse<Task[]>>(`/tasks?${params.toString()}`);
        return response.data.data;
    },

    getById: async (id: string): Promise<Task> => {
        const response = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
        return response.data.data;
    },

    create: async (data: CreateTaskInput): Promise<Task> => {
        const response = await api.post<ApiResponse<Task>>('/tasks', data);
        return response.data.data;
    },

    update: async (id: string, data: UpdateTaskInput): Promise<Task> => {
        const response = await api.put<ApiResponse<Task>>(`/tasks/${id}`, data);
        return response.data.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/tasks/${id}`);
    },

    bulkUpdate: async (params: {
        taskIds: string[];
        action: 'update_status' | 'update_priority';
        data: { status?: string; priority?: string };
    }): Promise<{ success: boolean; processed: number; failed: number; errors: Array<{ taskId: string; error: string }> }> => {
        const response = await api.post<ApiResponse<{ success: boolean; processed: number; failed: number; errors: Array<{ taskId: string; error: string }> }>>('/tasks/bulk', params);
        return response.data.data;
    },
};

// User API
export const userApi = {
    getAll: async (): Promise<User[]> => {
        const response = await api.get<ApiResponse<User[]>>('/users');
        return response.data.data;
    },
};

// Template API
export interface TaskTemplate {
    id: string;
    name: string;
    title: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    isGlobal: boolean;
    createdAt: string;
    creator: { id: string; name: string };
}

export interface CreateTemplateInput {
    name: string;
    title: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    isGlobal?: boolean;
}

export const templateApi = {
    getAll: async (): Promise<TaskTemplate[]> => {
        const response = await api.get<ApiResponse<TaskTemplate[]>>('/templates');
        return response.data.data;
    },

    getById: async (id: string): Promise<TaskTemplate> => {
        const response = await api.get<ApiResponse<TaskTemplate>>(`/templates/${id}`);
        return response.data.data;
    },

    create: async (data: CreateTemplateInput): Promise<TaskTemplate> => {
        const response = await api.post<ApiResponse<TaskTemplate>>('/templates', data);
        return response.data.data;
    },

    update: async (id: string, data: Partial<CreateTemplateInput>): Promise<TaskTemplate> => {
        const response = await api.put<ApiResponse<TaskTemplate>>(`/templates/${id}`, data);
        return response.data.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/templates/${id}`);
    },
};

// Notification API
export const notificationApi = {
    getAll: async (): Promise<{ notifications: Notification[]; unreadCount: number }> => {
        const response = await api.get<ApiResponse<{ notifications: Notification[]; unreadCount: number }>>('/notifications');
        return response.data.data;
    },

    markAsRead: async (id: string): Promise<void> => {
        await api.put(`/notifications/${id}/read`);
    },

    markAllAsRead: async (): Promise<void> => {
        await api.put('/notifications/read-all');
    },
};

// Admin API
export interface AdminStats {
    users: {
        total: number;
        active: number;
        suspended: number;
        byRole: Record<string, number>;
    };
    tasks: {
        total: number;
        byStatus: Record<string, number>;
    };
    recentUsers: Array<{ id: string; name: string; email: string; createdAt: string }>;
}

export interface AdminUser {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    lastLoginAt: string | null;
    createdAt: string;
    manager?: { id: string; name: string } | null;
    _count?: { directReports: number; createdTasks: number; assignedTasks: number };
}

export interface PaginatedUsers {
    users: AdminUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface AdminUserFilters {
    role?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

export const adminApi = {
    getStats: async (): Promise<AdminStats> => {
        const response = await api.get<ApiResponse<AdminStats>>('/admin/stats');
        return response.data.data;
    },

    getUsers: async (filters?: AdminUserFilters): Promise<PaginatedUsers> => {
        const params = new URLSearchParams();
        if (filters) {
            if (filters.role) params.set('role', filters.role);
            if (filters.isActive !== undefined) params.set('isActive', String(filters.isActive));
            if (filters.search) params.set('search', filters.search);
            if (filters.page) params.set('page', String(filters.page));
            if (filters.limit) params.set('limit', String(filters.limit));
        }
        const response = await api.get<ApiResponse<PaginatedUsers>>(`/admin/users?${params.toString()}`);
        return response.data.data;
    },

    getUserById: async (id: string): Promise<AdminUser> => {
        const response = await api.get<ApiResponse<AdminUser>>(`/admin/users/${id}`);
        return response.data.data;
    },

    createUser: async (data: { email: string; name: string; password: string; role?: string }): Promise<AdminUser> => {
        const response = await api.post<ApiResponse<AdminUser>>('/admin/users', data);
        return response.data.data;
    },

    updateUser: async (id: string, data: { name?: string; email?: string; role?: string; isActive?: boolean; managerId?: string | null }): Promise<AdminUser> => {
        const response = await api.put<ApiResponse<AdminUser>>(`/admin/users/${id}`, data);
        return response.data.data;
    },

    suspendUser: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await api.post<{ success: boolean; message: string }>(`/admin/users/${id}/suspend`);
        return response.data;
    },

    activateUser: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await api.post<{ success: boolean; message: string }>(`/admin/users/${id}/activate`);
        return response.data;
    },

    // Bulk operations
    bulkTaskOperation: async (data: {
        action: 'assign' | 'update_status' | 'update_priority' | 'delete' | 'archive';
        taskIds: string[];
        data?: { assigneeId?: string; status?: string; priority?: string };
    }): Promise<{ success: boolean; processed: number; failed: number; errors: Array<{ taskId: string; error: string }> }> => {
        const response = await api.post<ApiResponse<{ success: boolean; processed: number; failed: number; errors: Array<{ taskId: string; error: string }> }>>('/admin/tasks/bulk', data);
        return response.data.data;
    },

    bulkTaskPreview: async (taskIds: string[]): Promise<any> => {
        const response = await api.post<ApiResponse<any>>('/admin/tasks/bulk/preview', { taskIds });
        return response.data.data;
    },

    // Audit logs
    getAuditLogs: async (filters?: {
        entityType?: string;
        actorId?: string;
        action?: string;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
    }): Promise<{ logs: any[]; total: number; page: number; limit: number; totalPages: number }> => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) params.set(key, String(value));
            });
        }
        const response = await api.get<ApiResponse<{ logs: any[]; total: number; page: number; limit: number; totalPages: number }>>(`/admin/audit-logs?${params.toString()}`);
        return response.data.data;
    },

    getEntityAuditHistory: async (entityType: string, entityId: string): Promise<any[]> => {
        const response = await api.get<ApiResponse<any[]>>(`/admin/audit-logs/${entityType}/${entityId}`);
        return response.data.data;
    },
};
