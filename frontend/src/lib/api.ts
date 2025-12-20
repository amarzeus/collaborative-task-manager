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
};

// User API
export const userApi = {
    getAll: async (): Promise<User[]> => {
        const response = await api.get<ApiResponse<User[]>>('/users');
        return response.data.data;
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
