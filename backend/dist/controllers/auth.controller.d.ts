/**
 * Authentication Controller
 * Handles HTTP requests for user authentication
 */
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
export declare const authController: {
    /**
     * POST /api/v1/auth/register
     * Register a new user
     */
    register(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /api/v1/auth/login
     * Login user
     */
    login(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /api/v1/auth/logout
     * Logout user (clear cookie)
     */
    logout(_req: Request, res: Response): Promise<void>;
    /**
     * GET /api/v1/auth/me
     * Get current user profile
     */
    getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * PUT /api/v1/auth/profile
     * Update user profile
     */
    updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * PUT /api/v1/auth/password
     * Change user password
     */
    changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * DELETE /api/v1/auth/account
     * Delete user account
     */
    deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=auth.controller.d.ts.map