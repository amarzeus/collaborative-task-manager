/**
 * User Controller
 * Handles HTTP requests for user management
 */

import { Response, NextFunction } from 'express';
import { userRepository } from '../repositories/user.repository.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const userController = {
  /**
   * GET /api/v1/users
   * Get all users (for assignment dropdown)
   */
  async getUsers(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const users = await userRepository.findAll();
      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  },
};
