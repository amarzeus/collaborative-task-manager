/**
 * Authentication Service
 * Handles user registration, login, and profile management
 */
import type { RegisterDto, LoginDto, UpdateProfileDto } from '../dtos/index.js';
export interface AuthResponse {
    user: {
        id: string;
        email: string;
        name: string;
    };
    token: string;
}
export declare const authService: {
    /**
     * Register a new user
     * @throws AppError if email already exists
     */
    register(data: RegisterDto): Promise<AuthResponse>;
    /**
     * Login user with email and password
     * @throws AppError if credentials are invalid
     */
    login(data: LoginDto): Promise<AuthResponse>;
    /**
     * Get current user profile
     */
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        password: string;
        name: string;
        createdAt: Date;
    }>;
    /**
     * Update user profile
     */
    updateProfile(userId: string, data: UpdateProfileDto): Promise<{
        id: string;
        email: string;
        name: string;
    }>;
    /**
     * Change user password
     * @throws AppError if current password is invalid
     */
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        success: boolean;
    }>;
    /**
     * Delete user account
     */
    deleteAccount(userId: string, password: string): Promise<{
        success: boolean;
    }>;
};
//# sourceMappingURL=auth.service.d.ts.map