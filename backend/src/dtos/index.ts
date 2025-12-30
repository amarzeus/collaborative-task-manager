/**
 * Zod schemas for data validation (DTOs)
 * Used for API request validation
 */

import { z } from 'zod';

// ============== Auth DTOs ==============

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
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

// ============== Admin DTOs ==============

export const roleEnum = z.enum(['USER', 'TEAM_LEAD', 'MANAGER', 'ADMIN', 'SUPER_ADMIN']);

export const adminCreateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: roleEnum.default('USER'),
});

export const adminUpdateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  email: z.string().email('Invalid email address').optional(),
  role: roleEnum.optional(),
  isActive: z.boolean().optional(),
  managerId: z.string().uuid('Invalid manager ID').nullable().optional(),
});

export const adminUserQuerySchema = z.object({
  role: roleEnum.optional(),
  isActive: z.enum(['true', 'false']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type AdminCreateUserDto = z.infer<typeof adminCreateUserSchema>;
export type AdminUpdateUserDto = z.infer<typeof adminUpdateUserSchema>;
export type AdminUserQueryDto = z.infer<typeof adminUserQuerySchema>;

// ============== Organization DTOs ==============

export const planTypeEnum = z.enum(['FREE', 'TEAM', 'BUSINESS', 'ENTERPRISE']);

export const createOrganizationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  plan: planTypeEnum.optional(),
});

export type CreateOrganizationDto = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationDto = z.infer<typeof updateOrganizationSchema>;

// ============== Team DTOs ==============

export const teamRoleEnum = z.enum(['LEADER', 'MEMBER']);

export const createTeamSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
});

export const updateTeamSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

export const addTeamMemberSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  role: teamRoleEnum.default('MEMBER'),
});

export const updateTeamMemberSchema = z.object({
  role: teamRoleEnum,
});

export type CreateTeamDto = z.infer<typeof createTeamSchema>;
export type UpdateTeamDto = z.infer<typeof updateTeamSchema>;
export type AddTeamMemberDto = z.infer<typeof addTeamMemberSchema>;
export type UpdateTeamMemberDto = z.infer<typeof updateTeamMemberSchema>;
