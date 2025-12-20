/**
 * User Controller
 * Handles HTTP requests for user management
 */
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
export declare const userController: {
    /**
     * GET /api/v1/users
     * Get all users (for assignment dropdown)
     */
    getUsers(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=user.controller.d.ts.map