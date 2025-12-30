/**
 * Authentication Routes
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication endpoints
 */

import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
} from '../dtos/index.js';

export const authRouter = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *               name: { type: string }
 *     responses:
 *       201: { description: User registered successfully }
 *       400: { description: Validation error }
 */
authRouter.post('/register', validateBody(registerSchema), authController.register as any);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 */
authRouter.post('/login', validateBody(loginSchema), authController.login as any);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout user
 *     responses:
 *       200: { description: Logout successful }
 */
authRouter.post('/logout', authController.logout as any);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Current user data }
 *       401: { description: Unauthorized }
 */

// Protected routes
authRouter.get('/me', authenticate, authController.getMe as any);
authRouter.put(
  '/profile',
  authenticate,
  validateBody(updateProfileSchema),
  authController.updateProfile as any
);
authRouter.put(
  '/password',
  authenticate,
  validateBody(changePasswordSchema),
  authController.changePassword as any
);
authRouter.delete(
  '/account',
  authenticate,
  validateBody(deleteAccountSchema),
  authController.deleteAccount as any
);
