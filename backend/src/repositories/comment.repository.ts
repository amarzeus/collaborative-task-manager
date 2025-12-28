/**
 * Comment Repository
 * Data access layer for Comment entity
 */

import { prisma } from '../lib/prisma.js';

export interface CreateCommentData {
    content: string;
    taskId: string;
    userId: string;
}

export interface UpdateCommentData {
    content: string;
}

const commentSelect = {
    id: true,
    content: true,
    createdAt: true,
    updatedAt: true,
    taskId: true,
    userId: true,
    user: {
        select: { id: true, name: true, email: true },
    },
};

export const commentRepository = {
    /**
     * Find all comments for a specific task
     */
    async findByTaskId(taskId: string) {
        return prisma.comment.findMany({
            where: { taskId },
            select: commentSelect,
            orderBy: { createdAt: 'asc' },
        });
    },

    /**
     * Find comment by ID
     */
    async findById(id: string) {
        return prisma.comment.findUnique({
            where: { id },
            select: commentSelect,
        });
    },

    /**
     * Create a new comment
     */
    async create(data: CreateCommentData) {
        return prisma.comment.create({
            data,
            select: commentSelect,
        });
    },

    /**
     * Update a comment
     */
    async update(id: string, data: UpdateCommentData) {
        return prisma.comment.update({
            where: { id },
            data,
            select: commentSelect,
        });
    },

    /**
     * Delete a comment
     */
    async delete(id: string) {
        return prisma.comment.delete({
            where: { id },
        });
    },
};
