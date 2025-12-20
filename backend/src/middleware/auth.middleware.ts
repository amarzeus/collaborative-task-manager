/**
 * Authentication middleware
 * Verifies JWT tokens and attaches user to request
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../lib/errors.js';
import { prisma } from '../lib/prisma.js';

export interface JwtPayload {
    userId: string;
    email: string;
}

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        name: string;
    };
}

/**
 * Middleware to authenticate requests using JWT
 * Extracts token from cookies or Authorization header
 */
export async function authenticate(
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
): Promise<void> {
    try {
        // Get token from cookie or Authorization header
        const token =
            req.cookies?.token ||
            req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            throw AppError.unauthorized('Access token required');
        }

        // Verify token
        const secret = process.env.JWT_SECRET || 'fallback-secret';
        const decoded = jwt.verify(token, secret) as JwtPayload;

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, name: true },
        });

        if (!user) {
            throw AppError.unauthorized('User not found');
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(AppError.unauthorized('Invalid token'));
        } else if (error instanceof jwt.TokenExpiredError) {
            next(AppError.unauthorized('Token expired'));
        } else {
            next(error);
        }
    }
}
