/**
 * Admin Service
 * Business logic for admin user management operations
 */
import { Role } from '@prisma/client';
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
        manager?: {
            id: string;
            name: string;
        } | null;
        _count?: {
            directReports: number;
            createdTasks: number;
            assignedTasks: number;
        };
    }[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare const adminService: {
    /**
     * List all users with filtering and pagination
     */
    listUsers(query: AdminUserQueryDto): Promise<PaginatedUsers>;
    /**
     * Get a single user by ID with full details
     */
    getUserById(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        manager: {
            id: string;
            email: string;
            name: string;
        } | null;
        directReports: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
        }[];
        _count: {
            createdTasks: number;
            assignedTasks: number;
            notifications: number;
        };
    }>;
    /**
     * Create a new user (admin operation)
     */
    createUser(data: AdminCreateUserDto, creatorId: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
        createdAt: Date;
    }>;
    /**
     * Update a user (admin operation)
     */
    updateUser(id: string, data: AdminUpdateUserDto, adminId: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
        createdAt: Date;
        manager: {
            id: string;
            name: string;
        } | null;
    }>;
    /**
     * Suspend a user account
     */
    suspendUser(id: string, adminId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Activate a suspended user account
     */
    activateUser(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Get admin dashboard statistics
     */
    getStats(): Promise<{
        users: {
            total: number;
            active: number;
            suspended: number;
            byRole: Record<string, number>;
        };
        tasks: {
            total: number;
            byStatus: Record<string, number>;
        };
        recentUsers: {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
        }[];
    }>;
};
//# sourceMappingURL=admin.service.d.ts.map