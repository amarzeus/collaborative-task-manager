/**
 * Authentication Controller
 * Handles HTTP requests for user authentication
 */

import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' as const : 'lax' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const authController = {
    /**
     * POST /api/v1/auth/register
     * Register a new user
     */
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.register(req.body);

            // Set cookie
            res.cookie('token', result.token, COOKIE_OPTIONS);

            res.status(201).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/v1/auth/login
     * Login user
     */
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.login(req.body);

            // Set cookie
            res.cookie('token', result.token, COOKIE_OPTIONS);

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/v1/auth/logout
     * Logout user (clear cookie)
     */
    async logout(_req: Request, res: Response) {
        res.clearCookie('token');
        res.json({
            success: true,
            message: 'Logged out successfully',
        });
    },

    /**
     * GET /api/v1/auth/me
     * Get current user profile
     */
    async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const user = await authService.getProfile(req.user!.id);
            res.json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/v1/auth/profile
     * Update user profile
     */
    async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const user = await authService.updateProfile(req.user!.id, req.body);
            res.json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/v1/auth/password
     * Change user password
     */
    async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const { currentPassword, newPassword } = req.body;
            await authService.changePassword(req.user!.id, currentPassword, newPassword);
            res.json({
                success: true,
                message: 'Password changed successfully',
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * DELETE /api/v1/auth/account
     * Delete user account
     */
    async deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const { password } = req.body;
            await authService.deleteAccount(req.user!.id, password);
            res.clearCookie('token');
            res.json({
                success: true,
                message: 'Account deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    },
};

