/**
 * User Repository
 * Data access layer for User entity
 */

import { prisma } from '../lib/prisma.js';

export interface CreateUserData {
    email: string;
    password: string;
    name: string;
}

export const userRepository = {
    /**
     * Find user by email
     */
    async findByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email },
        });
    },

    /**
     * Find user by ID (includes password for verification)
     */
    async findById(id: string) {
        return prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                password: true,
                createdAt: true,
            },
        });
    },

    /**
     * Create a new user
     */
    async create(data: CreateUserData) {
        return prisma.user.create({
            data,
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
            },
        });
    },

    /**
     * Update user profile or password
     */
    async update(id: string, data: Partial<CreateUserData>) {
        return prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                email: true,
                name: true,
            },
        });
    },

    /**
     * Get all users (for assignment dropdown)
     */
    async findAll() {
        return prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
            },
            orderBy: { name: 'asc' },
        });
    },

    /**
     * Delete user account
     */
    async delete(id: string) {
        return prisma.user.delete({
            where: { id },
        });
    },
};

