/**
 * Zod schemas for data validation (DTOs)
 * Used for API request validation
 */

import { z } from 'zod';

// ============== Auth DTOs ==============

export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
    email: z.string().email('Invalid email address').optional(),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const deleteAccountSchema = z.object({
    password: z.string().min(1, 'Password is required'),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
export type DeleteAccountDto = z.infer<typeof deleteAccountSchema>;

// ============== Task DTOs ==============

export const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export const statusEnum = z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']);

export const createTaskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
    description: z.string().min(1, 'Description is required'),
    dueDate: z.string().datetime('Invalid date format'),
    priority: priorityEnum.default('MEDIUM'),
    status: statusEnum.default('TODO'),
    assignedToId: z.string().uuid('Invalid user ID').optional().nullable(),
});

export const updateTaskSchema = z.object({
    title: z.string().min(1).max(100).optional(),
    description: z.string().min(1).optional(),
    dueDate: z.string().datetime().optional(),
    priority: priorityEnum.optional(),
    status: statusEnum.optional(),
    assignedToId: z.string().uuid().optional().nullable(),
});

export const taskQuerySchema = z.object({
    status: statusEnum.optional(),
    priority: priorityEnum.optional(),
    assignedToMe: z.enum(['true', 'false']).optional(),
    createdByMe: z.enum(['true', 'false']).optional(),
    overdue: z.enum(['true', 'false']).optional(),
    sortBy: z.enum(['dueDate', 'createdAt', 'priority']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type CreateTaskDto = z.infer<typeof createTaskSchema>;
export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;
export type TaskQueryDto = z.infer<typeof taskQuerySchema>;
