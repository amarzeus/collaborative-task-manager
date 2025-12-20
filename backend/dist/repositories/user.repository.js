"use strict";
/**
 * User Repository
 * Data access layer for User entity
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = void 0;
const prisma_js_1 = require("../lib/prisma.js");
exports.userRepository = {
    /**
     * Find user by email
     */
    async findByEmail(email) {
        return prisma_js_1.prisma.user.findUnique({
            where: { email },
        });
    },
    async findById(id) {
        return prisma_js_1.prisma.user.findUnique({
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
    async create(data) {
        return prisma_js_1.prisma.user.create({
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
    async update(id, data) {
        return prisma_js_1.prisma.user.update({
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
        return prisma_js_1.prisma.user.findMany({
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
    async delete(id) {
        return prisma_js_1.prisma.user.delete({
            where: { id },
        });
    },
};
//# sourceMappingURL=user.repository.js.map