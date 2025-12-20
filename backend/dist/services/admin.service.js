"use strict";
/**
 * Admin Service
 * Business logic for admin user management operations
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_js_1 = require("../lib/prisma.js");
const errors_js_1 = require("../lib/errors.js");
exports.adminService = {
    /**
     * List all users with filtering and pagination
     */
    async listUsers(query) {
        const { role, isActive, search, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;
        // Build where clause
        const where = {};
        if (role) {
            where.role = role;
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
            prisma_js_1.prisma.user.findMany({
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
            prisma_js_1.prisma.user.count({ where }),
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
    async getUserById(id) {
        const user = await prisma_js_1.prisma.user.findUnique({
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
            throw errors_js_1.AppError.notFound('User not found');
        }
        return user;
    },
    /**
     * Create a new user (admin operation)
     */
    async createUser(data, creatorId) {
        // Check if email already exists
        const existing = await prisma_js_1.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existing) {
            throw errors_js_1.AppError.conflict('Email already registered');
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 12);
        // Create user
        const user = await prisma_js_1.prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                password: hashedPassword,
                role: data.role,
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
    async updateUser(id, data, adminId) {
        // Check user exists
        const existingUser = await prisma_js_1.prisma.user.findUnique({
            where: { id },
        });
        if (!existingUser) {
            throw errors_js_1.AppError.notFound('User not found');
        }
        // Prevent admin from modifying their own role
        if (id === adminId && data.role && data.role !== existingUser.role) {
            throw errors_js_1.AppError.forbidden('Cannot modify your own role');
        }
        // Check email uniqueness if being changed
        if (data.email && data.email !== existingUser.email) {
            const emailTaken = await prisma_js_1.prisma.user.findUnique({
                where: { email: data.email },
            });
            if (emailTaken) {
                throw errors_js_1.AppError.conflict('Email already taken');
            }
        }
        // Validate manager exists if being set
        if (data.managerId) {
            const manager = await prisma_js_1.prisma.user.findUnique({
                where: { id: data.managerId },
            });
            if (!manager) {
                throw errors_js_1.AppError.badRequest('Manager not found');
            }
            // Prevent circular management
            if (data.managerId === id) {
                throw errors_js_1.AppError.badRequest('User cannot be their own manager');
            }
        }
        // Build update data
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.email !== undefined)
            updateData.email = data.email;
        if (data.role !== undefined)
            updateData.role = data.role;
        if (data.isActive !== undefined)
            updateData.isActive = data.isActive;
        if (data.managerId !== undefined) {
            updateData.manager = data.managerId
                ? { connect: { id: data.managerId } }
                : { disconnect: true };
        }
        // Update user
        const user = await prisma_js_1.prisma.user.update({
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
    async suspendUser(id, adminId) {
        if (id === adminId) {
            throw errors_js_1.AppError.forbidden('Cannot suspend your own account');
        }
        const user = await prisma_js_1.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw errors_js_1.AppError.notFound('User not found');
        }
        if (!user.isActive) {
            throw errors_js_1.AppError.badRequest('User is already suspended');
        }
        // Prevent suspending SUPER_ADMIN
        if (user.role === 'SUPER_ADMIN') {
            throw errors_js_1.AppError.forbidden('Cannot suspend Super Admin');
        }
        await prisma_js_1.prisma.user.update({
            where: { id },
            data: { isActive: false },
        });
        return { success: true, message: 'User suspended' };
    },
    /**
     * Activate a suspended user account
     */
    async activateUser(id) {
        const user = await prisma_js_1.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw errors_js_1.AppError.notFound('User not found');
        }
        if (user.isActive) {
            throw errors_js_1.AppError.badRequest('User is already active');
        }
        await prisma_js_1.prisma.user.update({
            where: { id },
            data: { isActive: true },
        });
        return { success: true, message: 'User activated' };
    },
    /**
     * Get admin dashboard statistics
     */
    async getStats() {
        const [totalUsers, activeUsers, suspendedUsers, roleDistribution, totalTasks, tasksByStatus, recentUsers,] = await Promise.all([
            prisma_js_1.prisma.user.count(),
            prisma_js_1.prisma.user.count({ where: { isActive: true } }),
            prisma_js_1.prisma.user.count({ where: { isActive: false } }),
            prisma_js_1.prisma.user.groupBy({
                by: ['role'],
                _count: true,
            }),
            prisma_js_1.prisma.task.count(),
            prisma_js_1.prisma.task.groupBy({
                by: ['status'],
                _count: true,
            }),
            prisma_js_1.prisma.user.findMany({
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
                }, {}),
            },
            tasks: {
                total: totalTasks,
                byStatus: tasksByStatus.reduce((acc, item) => {
                    acc[item.status] = item._count;
                    return acc;
                }, {}),
            },
            recentUsers,
        };
    },
};
//# sourceMappingURL=admin.service.js.map