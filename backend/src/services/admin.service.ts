/**
 * Admin Service
 * Business logic for admin user management operations
 */

import bcrypt from 'bcryptjs';
import { Role, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';
import type { AdminCreateUserDto, AdminUpdateUserDto, AdminUserQueryDto } from '../dtos/index.js';

export interface PaginatedUsers {
    users: {
        id: string;
        email: string;
        name: string;
        role: Role;
        isActive: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        manager?: { id: string; name: string } | null;
        _count?: { directReports: number; createdTasks: number; assignedTasks: number };
    }[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const adminService = {
    /**
     * List all users with filtering and pagination
     */
    async listUsers(query: AdminUserQueryDto): Promise<PaginatedUsers> {
        const { role, isActive, search, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Prisma.UserWhereInput = {};

        if (role) {
            where.role = role as Role;
        }

        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Get users with pagination
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    isActive: true,
                    lastLoginAt: true,
                    createdAt: true,
                    manager: { select: { id: true, name: true } },
                    _count: {
                        select: {
                            directReports: true,
                            createdTasks: true,
                            assignedTasks: true,
                        },
                    },
                },
            }),
            prisma.user.count({ where }),
        ]);

        return {
            users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    },

    /**
     * Get a single user by ID with full details
     */
    async getUserById(id: string) {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                lastLoginAt: true,
                createdAt: true,
                updatedAt: true,
                manager: { select: { id: true, name: true, email: true } },
                directReports: {
                    select: { id: true, name: true, email: true, role: true },
                },
                _count: {
                    select: {
                        createdTasks: true,
                        assignedTasks: true,
                        notifications: true,
                    },
                },
            },
        });

        if (!user) {
            throw AppError.notFound('User not found');
        }

        return user;
    },

    /**
     * Create a new user (admin operation)
     */
    async createUser(data: AdminCreateUserDto, creatorId: string) {
        // Check if email already exists
        const existing = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existing) {
            throw AppError.conflict('Email already registered');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                password: hashedPassword,
                role: data.role as Role,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        });

        return user;
    },

    /**
     * Update a user (admin operation)
     */
    async updateUser(id: string, data: AdminUpdateUserDto, adminId: string) {
        // Check user exists
        const existingUser = await prisma.user.findUnique({
            where: { id },
        });

        if (!existingUser) {
            throw AppError.notFound('User not found');
        }

        // Prevent admin from modifying their own role
        if (id === adminId && data.role && data.role !== existingUser.role) {
            throw AppError.forbidden('Cannot modify your own role');
        }

        // Check email uniqueness if being changed
        if (data.email && data.email !== existingUser.email) {
            const emailTaken = await prisma.user.findUnique({
                where: { email: data.email },
            });
            if (emailTaken) {
                throw AppError.conflict('Email already taken');
            }
        }

        // Validate manager exists if being set
        if (data.managerId) {
            const manager = await prisma.user.findUnique({
                where: { id: data.managerId },
            });
            if (!manager) {
                throw AppError.badRequest('Manager not found');
            }
            // Prevent circular management
            if (data.managerId === id) {
                throw AppError.badRequest('User cannot be their own manager');
            }
        }

        // Build update data
        const updateData: Prisma.UserUpdateInput = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.email !== undefined) updateData.email = data.email;
        if (data.role !== undefined) updateData.role = data.role as Role;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;
        if (data.managerId !== undefined) {
            updateData.manager = data.managerId
                ? { connect: { id: data.managerId } }
                : { disconnect: true };
        }

        // Update user
        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
                manager: { select: { id: true, name: true } },
            },
        });

        return user;
    },

    /**
     * Suspend a user account
     */
    async suspendUser(id: string, adminId: string) {
        if (id === adminId) {
            throw AppError.forbidden('Cannot suspend your own account');
        }

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw AppError.notFound('User not found');
        }

        if (!user.isActive) {
            throw AppError.badRequest('User is already suspended');
        }

        // Prevent suspending SUPER_ADMIN
        if (user.role === 'SUPER_ADMIN') {
            throw AppError.forbidden('Cannot suspend Super Admin');
        }

        await prisma.user.update({
            where: { id },
            data: { isActive: false },
        });

        return { success: true, message: 'User suspended' };
    },

    /**
     * Activate a suspended user account
     */
    async activateUser(id: string) {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw AppError.notFound('User not found');
        }

        if (user.isActive) {
            throw AppError.badRequest('User is already active');
        }

        await prisma.user.update({
            where: { id },
            data: { isActive: true },
        });

        return { success: true, message: 'User activated' };
    },

    /**
     * Get admin dashboard statistics
     */
    async getStats() {
        const [
            totalUsers,
            activeUsers,
            suspendedUsers,
            roleDistribution,
            totalTasks,
            tasksByStatus,
            recentUsers,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { isActive: true } }),
            prisma.user.count({ where: { isActive: false } }),
            prisma.user.groupBy({
                by: ['role'],
                _count: true,
            }),
            prisma.task.count(),
            prisma.task.groupBy({
                by: ['status'],
                _count: true,
            }),
            prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { id: true, name: true, email: true, createdAt: true },
            }),
        ]);

        return {
            users: {
                total: totalUsers,
                active: activeUsers,
                suspended: suspendedUsers,
                byRole: roleDistribution.reduce((acc, item) => {
                    acc[item.role] = item._count;
                    return acc;
                }, {} as Record<string, number>),
            },
            tasks: {
                total: totalTasks,
                byStatus: tasksByStatus.reduce((acc, item) => {
                    acc[item.status] = item._count;
                    return acc;
                }, {} as Record<string, number>),
            },
            recentUsers,
        };
    },
};
