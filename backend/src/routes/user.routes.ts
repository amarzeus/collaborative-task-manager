/**
 * User Routes
 */

import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export const userRouter = Router();

// All user routes require authentication
userRouter.use(authenticate);

userRouter.get('/', userController.getUsers);
