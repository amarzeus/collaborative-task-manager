/**
 * AI Assistant Service
 * Handles LLM integration with function calling for task management
 */

import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';

// AI Function definitions for task management
export const AI_FUNCTIONS = [
    {
        name: 'create_task',
        description: 'Create a new task with specified title, description, due date, and priority',
        parameters: {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'Task title (max 100 chars)' },
                description: { type: 'string', description: 'Task description' },
                dueDate: { type: 'string', description: 'Due date in ISO format' },
                priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], description: 'Task priority' },
                assignedToId: { type: 'string', description: 'Optional user ID to assign task to' },
            },
            required: ['title', 'description', 'dueDate'],
        },
    },
    {
        name: 'list_tasks',
        description: 'List tasks with optional filters',
        parameters: {
            type: 'object',
            properties: {
                status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'] },
                priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
                assignedToMe: { type: 'boolean', description: 'Filter to tasks assigned to current user' },
                overdue: { type: 'boolean', description: 'Filter to overdue tasks' },
                limit: { type: 'number', description: 'Max number of tasks to return' },
            },
        },
    },
    {
        name: 'update_task',
        description: 'Update an existing task',
        parameters: {
            type: 'object',
            properties: {
                taskId: { type: 'string', description: 'Task ID to update' },
                title: { type: 'string' },
                description: { type: 'string' },
                status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'] },
                priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
                dueDate: { type: 'string' },
                assignedToId: { type: 'string' },
            },
            required: ['taskId'],
        },
    },
    {
        name: 'delete_task',
        description: 'Delete a task by ID',
        parameters: {
            type: 'object',
            properties: {
                taskId: { type: 'string', description: 'Task ID to delete' },
            },
            required: ['taskId'],
        },
    },
    {
        name: 'get_analytics',
        description: 'Get task analytics and insights',
        parameters: {
            type: 'object',
            properties: {
                type: {
                    type: 'string',
                    enum: ['overview', 'trends', 'priority', 'productivity'],
                    description: 'Type of analytics to retrieve',
                },
                days: { type: 'number', description: 'Number of days to analyze (default 7)' },
            },
            required: ['type'],
        },
    },
    {
        name: 'search_tasks',
        description: 'Search for tasks by keyword',
        parameters: {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'Search query' },
            },
            required: ['query'],
        },
    },
];

// System prompt for AI assistant
export const SYSTEM_PROMPT = `You are TaskFlow AI, an intelligent assistant for task management.

You help users manage their tasks through natural language. You can:
- Create, update, and delete tasks
- List and search tasks with filters
- Provide analytics and insights
- Answer questions about task status and workload

When users request task operations, use the provided functions.
Be concise, professional, and helpful.
Always confirm destructive actions (delete) before executing.
Format task lists nicely with priorities and due dates.`;

export interface AIContext {
    userId: string;
    organizationId?: string | null;
    teamIds?: string[];
    userRole: string;
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system' | 'function';
    content: string;
    name?: string;
}

export const aiService = {
    /**
     * Get conversation history for user
     */
    async getConversation(userId: string) {
        const conversation = await prisma.aIConversation.findFirst({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
        });

        if (!conversation) {
            return { messages: [] };
        }

        return {
            id: conversation.id,
            messages: conversation.messages as unknown as ChatMessage[],
        };
    },

    /**
     * Save conversation
     */
    async saveConversation(userId: string, messages: ChatMessage[]) {
        const existing = await prisma.aIConversation.findFirst({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
        });

        if (existing) {
            return prisma.aIConversation.update({
                where: { id: existing.id },
                data: { messages: messages as any, updatedAt: new Date() },
            });
        }

        return prisma.aIConversation.create({
            data: { userId, messages: messages as any },
        });
    },

    /**
     * Log AI action for audit
     */
    async logAction(userId: string, action: string, params: any, result: string, error?: string) {
        return prisma.aIAuditLog.create({
            data: {
                userId,
                action,
                params: params as any,
                result,
                error,
            },
        });
    },

    /**
     * Execute AI function call
     */
    async executeFunction(
        functionName: string,
        args: any,
        context: AIContext
    ): Promise<{ success: boolean; result?: any; error?: string }> {
        try {
            switch (functionName) {
                case 'create_task':
                    return await this.createTask(args, context);
                case 'list_tasks':
                    return await this.listTasks(args, context);
                case 'update_task':
                    return await this.updateTask(args, context);
                case 'delete_task':
                    return await this.deleteTask(args, context);
                case 'get_analytics':
                    return await this.getAnalytics(args, context);
                case 'search_tasks':
                    return await this.searchTasks(args, context);
                default:
                    return { success: false, error: `Unknown function: ${functionName}` };
            }
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    // Function implementations
    async createTask(args: any, context: AIContext) {
        const task = await prisma.task.create({
            data: {
                title: args.title,
                description: args.description || '',
                dueDate: new Date(args.dueDate),
                priority: args.priority || 'MEDIUM',
                status: 'TODO',
                creatorId: context.userId,
                assignedToId: args.assignedToId || null,
                organizationId: context.organizationId || null,
            },
            include: {
                creator: { select: { name: true } },
                assignedTo: { select: { name: true } },
            },
        });

        await this.logAction(context.userId, 'create_task', args, 'SUCCESS');
        return { success: true, result: task };
    },

    async listTasks(args: any, context: AIContext) {
        const where: any = {
            OR: [
                { creatorId: context.userId },
                { assignedToId: context.userId },
            ],
        };

        if (context.organizationId) {
            where.organizationId = context.organizationId;
        }

        if (args.status) where.status = args.status;
        if (args.priority) where.priority = args.priority;
        if (args.assignedToMe) where.assignedToId = context.userId;
        if (args.overdue) {
            where.dueDate = { lt: new Date() };
            where.status = { not: 'COMPLETED' };
        }

        const tasks = await prisma.task.findMany({
            where,
            take: args.limit || 10,
            orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
            include: {
                creator: { select: { name: true } },
                assignedTo: { select: { name: true } },
            },
        });

        await this.logAction(context.userId, 'list_tasks', args, 'SUCCESS');
        return { success: true, result: tasks };
    },

    async updateTask(args: any, context: AIContext) {
        const { taskId, ...updateData } = args;

        // Verify ownership/access
        const task = await prisma.task.findUnique({ where: { id: taskId } });
        if (!task) {
            return { success: false, error: 'Task not found' };
        }
        if (task.creatorId !== context.userId && task.assignedToId !== context.userId) {
            return { success: false, error: 'Not authorized to update this task' };
        }

        const data: any = {};
        if (updateData.title) data.title = updateData.title;
        if (updateData.description) data.description = updateData.description;
        if (updateData.status) data.status = updateData.status;
        if (updateData.priority) data.priority = updateData.priority;
        if (updateData.dueDate) data.dueDate = new Date(updateData.dueDate);
        if (updateData.assignedToId !== undefined) data.assignedToId = updateData.assignedToId;

        const updated = await prisma.task.update({
            where: { id: taskId },
            data,
            include: {
                creator: { select: { name: true } },
                assignedTo: { select: { name: true } },
            },
        });

        await this.logAction(context.userId, 'update_task', args, 'SUCCESS');
        return { success: true, result: updated };
    },

    async deleteTask(args: any, context: AIContext) {
        const task = await prisma.task.findUnique({ where: { id: args.taskId } });
        if (!task) {
            return { success: false, error: 'Task not found' };
        }
        if (task.creatorId !== context.userId) {
            return { success: false, error: 'Only the creator can delete this task' };
        }

        await prisma.task.delete({ where: { id: args.taskId } });
        await this.logAction(context.userId, 'delete_task', args, 'SUCCESS');
        return { success: true, result: { message: 'Task deleted successfully' } };
    },

    async getAnalytics(args: any, context: AIContext) {
        const where: any = {
            OR: [
                { creatorId: context.userId },
                { assignedToId: context.userId },
            ],
        };

        if (context.organizationId) {
            where.organizationId = context.organizationId;
        }

        const days = args.days || 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        let result: any;

        switch (args.type) {
            case 'overview':
                const [total, completed, inProgress, overdue] = await Promise.all([
                    prisma.task.count({ where }),
                    prisma.task.count({ where: { ...where, status: 'COMPLETED' } }),
                    prisma.task.count({ where: { ...where, status: 'IN_PROGRESS' } }),
                    prisma.task.count({
                        where: { ...where, status: { not: 'COMPLETED' }, dueDate: { lt: new Date() } },
                    }),
                ]);
                result = { total, completed, inProgress, overdue };
                break;

            case 'priority':
                const tasks = await prisma.task.findMany({
                    where: { ...where, status: { not: 'COMPLETED' } },
                    select: { priority: true },
                });
                result = {
                    low: tasks.filter((t) => t.priority === 'LOW').length,
                    medium: tasks.filter((t) => t.priority === 'MEDIUM').length,
                    high: tasks.filter((t) => t.priority === 'HIGH').length,
                    urgent: tasks.filter((t) => t.priority === 'URGENT').length,
                };
                break;

            case 'productivity':
                const completedRecently = await prisma.task.count({
                    where: {
                        ...where,
                        status: 'COMPLETED',
                        updatedAt: { gte: startDate },
                    },
                });
                result = {
                    completedLast7Days: completedRecently,
                    avgPerDay: Math.round((completedRecently / days) * 10) / 10,
                };
                break;

            default:
                result = { message: 'Unknown analytics type' };
        }

        await this.logAction(context.userId, 'get_analytics', args, 'SUCCESS');
        return { success: true, result };
    },

    async searchTasks(args: any, context: AIContext) {
        const where: any = {
            OR: [
                { title: { contains: args.query, mode: 'insensitive' } },
                { description: { contains: args.query, mode: 'insensitive' } },
            ],
            AND: {
                OR: [
                    { creatorId: context.userId },
                    { assignedToId: context.userId },
                ],
            },
        };

        if (context.organizationId) {
            where.AND.organizationId = context.organizationId;
        }

        const tasks = await prisma.task.findMany({
            where,
            take: 10,
            include: {
                creator: { select: { name: true } },
                assignedTo: { select: { name: true } },
            },
        });

        await this.logAction(context.userId, 'search_tasks', args, 'SUCCESS');
        return { success: true, result: tasks };
    },
};
