/**
 * User Repository
 * Data access layer for User entity
 */

import { prisma } from '../lib/prisma.js';

export interface CreateUserData {
    email: string;
    password: string;
    name: string;
    role?: 'USER' | 'TEAM_LEAD' | 'MANAGER' | 'ADMIN' | 'SUPER_ADMIN';
}

export interface UpdateUserData {
    email?: string;
    password?: string;
    name?: string;
    lastLoginAt?: Date;
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

    async findById(id: string) {
        return prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                password: true,
                createdAt: true,
            },
        });
    },

    async create(data: CreateUserData) {
        return prisma.user.create({
            data,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });
    },

    async update(id: string, data: UpdateUserData) {
        return prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
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

