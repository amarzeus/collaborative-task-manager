"use strict";
/**
 * Authentication Service
 * Handles user registration, login, and profile management
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_repository_js_1 = require("../repositories/user.repository.js");
const errors_js_1 = require("../lib/errors.js");
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
/**
 * Check if an email matches any configured admin email patterns
 * Supports exact match, wildcard prefix (*@domain.com), or wildcard domain (user@*)
 */
function isAdminEmail(email) {
    const adminEmails = process.env.ADMIN_EMAILS || '';
    if (!adminEmails)
        return false;
    const patterns = adminEmails.split(',').map(p => p.trim().toLowerCase());
    const emailLower = email.toLowerCase();
    return patterns.some(pattern => {
        if (!pattern)
            return false;
        // Exact match
        if (pattern === emailLower)
            return true;
        // Wildcard patterns
        if (pattern.includes('*')) {
            // *@domain.com - matches any user at that domain
            if (pattern.startsWith('*@')) {
                const domain = pattern.slice(2);
                return emailLower.endsWith('@' + domain);
            }
            // user@* - matches that user at any domain
            if (pattern.endsWith('@*')) {
                const user = pattern.slice(0, -2);
                return emailLower.startsWith(user + '@');
            }
        }
        return false;
    });
}
exports.authService = {
    /**
     * Register a new user
     * Auto-assigns ADMIN role if email matches configured admin patterns
     * @throws AppError if email already exists
     */
    async register(data) {
        // Check if email already exists
        const existing = await user_repository_js_1.userRepository.findByEmail(data.email);
        if (existing) {
            throw errors_js_1.AppError.conflict('Email already registered');
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 12);
        // Determine role based on email pattern
        const role = isAdminEmail(data.email) ? 'ADMIN' : 'USER';
        // Create user with auto-assigned role
        const user = await user_repository_js_1.userRepository.create({
            email: data.email,
            password: hashedPassword,
            name: data.name,
            role,
        });
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        return { user, token };
    },
    /**
     * Login user with email and password
     * @throws AppError if credentials are invalid
     */
    async login(data) {
        // Find user by email
        const user = await user_repository_js_1.userRepository.findByEmail(data.email);
        if (!user) {
            throw errors_js_1.AppError.unauthorized('Invalid email or password');
        }
        // Check if user is active
        if (!user.isActive) {
            throw errors_js_1.AppError.forbidden('Account is suspended');
        }
        // Verify password
        const isValidPassword = await bcryptjs_1.default.compare(data.password, user.password);
        if (!isValidPassword) {
            throw errors_js_1.AppError.unauthorized('Invalid email or password');
        }
        // Update lastLoginAt
        await user_repository_js_1.userRepository.update(user.id, { lastLoginAt: new Date() });
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            token,
        };
    },
    /**
     * Get current user profile
     */
    async getProfile(userId) {
        const user = await user_repository_js_1.userRepository.findById(userId);
        if (!user) {
            throw errors_js_1.AppError.notFound('User not found');
        }
        return user;
    },
    /**
     * Update user profile
     */
    async updateProfile(userId, data) {
        // If updating email, check if it's already taken
        if (data.email) {
            const existing = await user_repository_js_1.userRepository.findByEmail(data.email);
            if (existing && existing.id !== userId) {
                throw errors_js_1.AppError.conflict('Email already taken');
            }
        }
        return user_repository_js_1.userRepository.update(userId, data);
    },
    /**
     * Change user password
     * @throws AppError if current password is invalid
     */
    async changePassword(userId, currentPassword, newPassword) {
        // Get user with password
        const user = await user_repository_js_1.userRepository.findById(userId);
        if (!user) {
            throw errors_js_1.AppError.notFound('User not found');
        }
        // Verify current password
        const isValidPassword = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isValidPassword) {
            throw errors_js_1.AppError.unauthorized('Current password is incorrect');
        }
        // Hash new password
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
        // Update password
        await user_repository_js_1.userRepository.update(userId, { password: hashedPassword });
        return { success: true };
    },
    /**
     * Delete user account
     */
    async deleteAccount(userId, password) {
        // Get user
        const user = await user_repository_js_1.userRepository.findById(userId);
        if (!user) {
            throw errors_js_1.AppError.notFound('User not found');
        }
        // Verify password before deletion
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            throw errors_js_1.AppError.unauthorized('Password is incorrect');
        }
        // Delete user (cascade will handle related data)
        await user_repository_js_1.userRepository.delete(userId);
        return { success: true };
    },
};
//# sourceMappingURL=auth.service.js.map