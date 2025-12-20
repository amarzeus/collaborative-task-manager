/**
 * User Repository
 * Data access layer for User entity
 */
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
export declare const userRepository: {
    /**
     * Find user by email
     */
    findByEmail(email: string): Promise<{
        id: string;
        email: string;
        password: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        managerId: string | null;
    } | null>;
    findById(id: string): Promise<{
        id: string;
        email: string;
        password: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
        createdAt: Date;
    } | null>;
    create(data: CreateUserData): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
    }>;
    update(id: string, data: UpdateUserData): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
    /**
     * Get all users (for assignment dropdown)
     */
    findAll(): Promise<{
        id: string;
        email: string;
        name: string;
    }[]>;
    /**
     * Delete user account
     */
    delete(id: string): Promise<{
        id: string;
        email: string;
        password: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        managerId: string | null;
    }>;
};
//# sourceMappingURL=user.repository.d.ts.map