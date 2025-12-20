"use strict";
/**
 * Authentication Controller
 * Handles HTTP requests for user authentication
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_js_1 = require("../services/auth.service.js");
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
exports.authController = {
    /**
     * POST /api/v1/auth/register
     * Register a new user
     */
    async register(req, res, next) {
        try {
            const result = await auth_service_js_1.authService.register(req.body);
            // Set cookie
            res.cookie('token', result.token, COOKIE_OPTIONS);
            res.status(201).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * POST /api/v1/auth/login
     * Login user
     */
    async login(req, res, next) {
        try {
            const result = await auth_service_js_1.authService.login(req.body);
            // Set cookie
            res.cookie('token', result.token, COOKIE_OPTIONS);
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * POST /api/v1/auth/logout
     * Logout user (clear cookie)
     */
    async logout(_req, res) {
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
    async getMe(req, res, next) {
        try {
            const user = await auth_service_js_1.authService.getProfile(req.user.id);
            res.json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * PUT /api/v1/auth/profile
     * Update user profile
     */
    async updateProfile(req, res, next) {
        try {
            const user = await auth_service_js_1.authService.updateProfile(req.user.id, req.body);
            res.json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * PUT /api/v1/auth/password
     * Change user password
     */
    async changePassword(req, res, next) {
        try {
            const { currentPassword, newPassword } = req.body;
            await auth_service_js_1.authService.changePassword(req.user.id, currentPassword, newPassword);
            res.json({
                success: true,
                message: 'Password changed successfully',
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * DELETE /api/v1/auth/account
     * Delete user account
     */
    async deleteAccount(req, res, next) {
        try {
            const { password } = req.body;
            await auth_service_js_1.authService.deleteAccount(req.user.id, password);
            res.clearCookie('token');
            res.json({
                success: true,
                message: 'Account deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=auth.controller.js.map