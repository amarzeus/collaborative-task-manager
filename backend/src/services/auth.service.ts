/**
 * Authentication Service
 * Handles user registration, login, and profile management
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository.js';
import { AppError } from '../lib/errors.js';
import type { RegisterDto, LoginDto, UpdateProfileDto } from '../dtos/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface AuthResponse {
    user: {
        id: string;
        email: string;
        name: string;
    };
    token: string;
}

export const authService = {
    /**
     * Register a new user
     * @throws AppError if email already exists
     */
    async register(data: RegisterDto): Promise<AuthResponse> {
        // Check if email already exists
        const existing = await userRepository.findByEmail(data.email);
        if (existing) {
            throw AppError.conflict('Email already registered');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 12);

        // Create user
        const user = await userRepository.create({
            email: data.email,
            password: hashedPassword,
            name: data.name,
        });

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
        );

        return { user, token };
    },

    /**
     * Login user with email and password
     * @throws AppError if credentials are invalid
     */
    async login(data: LoginDto): Promise<AuthResponse> {
        // Find user by email
        const user = await userRepository.findByEmail(data.email);
        if (!user) {
            throw AppError.unauthorized('Invalid email or password');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(data.password, user.password);
        if (!isValidPassword) {
            throw AppError.unauthorized('Invalid email or password');
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
        );

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
            token,
        };
    },

    /**
     * Get current user profile
     */
    async getProfile(userId: string) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw AppError.notFound('User not found');
        }
        return user;
    },

    /**
     * Update user profile
     */
    async updateProfile(userId: string, data: UpdateProfileDto) {
        // If updating email, check if it's already taken
        if (data.email) {
            const existing = await userRepository.findByEmail(data.email);
            if (existing && existing.id !== userId) {
                throw AppError.conflict('Email already taken');
            }
        }

        return userRepository.update(userId, data);
    },

    /**
     * Change user password
     * @throws AppError if current password is invalid
     */
    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        // Get user with password
        const user = await userRepository.findById(userId);
        if (!user) {
            throw AppError.notFound('User not found');
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            throw AppError.unauthorized('Current password is incorrect');
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update password
        await userRepository.update(userId, { password: hashedPassword });

        return { success: true };
    },

    /**
     * Delete user account
     */
    async deleteAccount(userId: string, password: string) {
        // Get user
        const user = await userRepository.findById(userId);
        if (!user) {
            throw AppError.notFound('User not found');
        }

        // Verify password before deletion
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw AppError.unauthorized('Password is incorrect');
        }

        // Delete user (cascade will handle related data)
        await userRepository.delete(userId);

        return { success: true };
    },
};
