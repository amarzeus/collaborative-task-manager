/**
 * User Repository
 * Data access layer for User entity
 */
export interface CreateUserData {
    email: string;
    password: string;
    name: string;
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
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    /**
     * Find user by ID (includes password for verification)
     */
    findById(id: string): Promise<{
        id: string;
        email: string;
        password: string;
        name: string;
        createdAt: Date;
    } | null>;
    /**
     * Create a new user
     */
    create(data: CreateUserData): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
    }>;
    /**
     * Update user profile or password
     */
    update(id: string, data: Partial<CreateUserData>): Promise<{
        id: string;
        email: string;
        name: string;
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
        createdAt: Date;
        updatedAt: Date;
    }>;
};
//# sourceMappingURL=user.repository.d.ts.map