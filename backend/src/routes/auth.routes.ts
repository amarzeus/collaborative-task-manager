/**
 * Authentication Routes
 */

import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema, deleteAccountSchema } from '../dtos/index.js';

export const authRouter = Router();

// Public routes
authRouter.post('/register', validateBody(registerSchema), authController.register);
authRouter.post('/login', validateBody(loginSchema), authController.login);
authRouter.post('/logout', authController.logout);

// Protected routes
authRouter.get('/me', authenticate, authController.getMe);
authRouter.put('/profile', authenticate, validateBody(updateProfileSchema), authController.updateProfile);
authRouter.put('/password', authenticate, validateBody(changePasswordSchema), authController.changePassword);
authRouter.delete('/account', authenticate, validateBody(deleteAccountSchema), authController.deleteAccount);

