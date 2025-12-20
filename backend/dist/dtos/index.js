"use strict";
/**
 * Zod schemas for data validation (DTOs)
 * Used for API request validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskQuerySchema = exports.updateTaskSchema = exports.createTaskSchema = exports.statusEnum = exports.priorityEnum = exports.deleteAccountSchema = exports.changePasswordSchema = exports.updateProfileSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// ============== Auth DTOs ==============
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    name: zod_1.z.string().min(1, 'Name is required').max(100, 'Name too long'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
    email: zod_1.z.string().email('Invalid email address').optional(),
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: zod_1.z.string().min(6, 'New password must be at least 6 characters'),
});
exports.deleteAccountSchema = zod_1.z.object({
    password: zod_1.z.string().min(1, 'Password is required'),
});
// ============== Task DTOs ==============
exports.priorityEnum = zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
exports.statusEnum = zod_1.z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']);
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
    description: zod_1.z.string().min(1, 'Description is required'),
    dueDate: zod_1.z.string().datetime('Invalid date format'),
    priority: exports.priorityEnum.default('MEDIUM'),
    status: exports.statusEnum.default('TODO'),
    assignedToId: zod_1.z.string().uuid('Invalid user ID').optional().nullable(),
});
exports.updateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(100).optional(),
    description: zod_1.z.string().min(1).optional(),
    dueDate: zod_1.z.string().datetime().optional(),
    priority: exports.priorityEnum.optional(),
    status: exports.statusEnum.optional(),
    assignedToId: zod_1.z.string().uuid().optional().nullable(),
});
exports.taskQuerySchema = zod_1.z.object({
    status: exports.statusEnum.optional(),
    priority: exports.priorityEnum.optional(),
    assignedToMe: zod_1.z.enum(['true', 'false']).optional(),
    createdByMe: zod_1.z.enum(['true', 'false']).optional(),
    overdue: zod_1.z.enum(['true', 'false']).optional(),
    sortBy: zod_1.z.enum(['dueDate', 'createdAt', 'priority']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
});
//# sourceMappingURL=index.js.map