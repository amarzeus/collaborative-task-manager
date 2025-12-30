/**
 * User Controller
 * Handles HTTP requests for user management
 */

import { Request, Response, NextFunction } from 'express';
import { userRepository } from '../repositories/user.repository.js';


export const userController = {
  /**
   * GET /api/v1/users
   * Get all users (for assignment dropdown)
   */
  async getUsers(_req: Request, res: Response, next: NextFunction) {
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
