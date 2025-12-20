/**
 * Zod schemas for data validation (DTOs)
 * Used for API request validation
 */
import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    name: string;
}, {
    email: string;
    password: string;
    name: string;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const updateProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    name?: string | undefined;
}, {
    email?: string | undefined;
    name?: string | undefined;
}>;
export declare const changePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
}>;
export declare const deleteAccountSchema: z.ZodObject<{
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
}, {
    password: string;
}>;
export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
export type DeleteAccountDto = z.infer<typeof deleteAccountSchema>;
export declare const priorityEnum: z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>;
export declare const statusEnum: z.ZodEnum<["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"]>;
export declare const createTaskSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    dueDate: z.ZodString;
    priority: z.ZodDefault<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>>;
    status: z.ZodDefault<z.ZodEnum<["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"]>>;
    assignedToId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status: "TODO" | "IN_PROGRESS" | "REVIEW" | "COMPLETED";
    title: string;
    description: string;
    dueDate: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    assignedToId?: string | null | undefined;
}, {
    title: string;
    description: string;
    dueDate: string;
    status?: "TODO" | "IN_PROGRESS" | "REVIEW" | "COMPLETED" | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    assignedToId?: string | null | undefined;
}>;
export declare const updateTaskSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>>;
    status: z.ZodOptional<z.ZodEnum<["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"]>>;
    assignedToId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status?: "TODO" | "IN_PROGRESS" | "REVIEW" | "COMPLETED" | undefined;
    title?: string | undefined;
    description?: string | undefined;
    dueDate?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    assignedToId?: string | null | undefined;
}, {
    status?: "TODO" | "IN_PROGRESS" | "REVIEW" | "COMPLETED" | undefined;
    title?: string | undefined;
    description?: string | undefined;
    dueDate?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    assignedToId?: string | null | undefined;
}>;
export declare const taskQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"]>>;
    priority: z.ZodOptional<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>>;
    assignedToMe: z.ZodOptional<z.ZodEnum<["true", "false"]>>;
    createdByMe: z.ZodOptional<z.ZodEnum<["true", "false"]>>;
    overdue: z.ZodOptional<z.ZodEnum<["true", "false"]>>;
    sortBy: z.ZodOptional<z.ZodEnum<["dueDate", "createdAt", "priority"]>>;
    sortOrder: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "TODO" | "IN_PROGRESS" | "REVIEW" | "COMPLETED" | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    assignedToMe?: "true" | "false" | undefined;
    createdByMe?: "true" | "false" | undefined;
    overdue?: "true" | "false" | undefined;
    sortBy?: "createdAt" | "dueDate" | "priority" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}, {
    status?: "TODO" | "IN_PROGRESS" | "REVIEW" | "COMPLETED" | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    assignedToMe?: "true" | "false" | undefined;
    createdByMe?: "true" | "false" | undefined;
    overdue?: "true" | "false" | undefined;
    sortBy?: "createdAt" | "dueDate" | "priority" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export type CreateTaskDto = z.infer<typeof createTaskSchema>;
export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;
export type TaskQueryDto = z.infer<typeof taskQuerySchema>;
//# sourceMappingURL=index.d.ts.map