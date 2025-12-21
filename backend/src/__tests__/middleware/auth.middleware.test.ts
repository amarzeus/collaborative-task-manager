/**
 * Unit tests for auth middleware - JWT verification
 * TDD: Mandatory test 1 of 3
 */

import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../lib/errors';

// Mock Prisma
jest.mock('../../lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
        },
    },
}));

describe('authMiddleware.verifyJWT', () => {
    let mockReq: Partial<AuthenticatedRequest>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER' as const,
        isActive: true,
    };

    beforeEach(() => {
        mockReq = {
            cookies: {},
            headers: {},
        };
        mockRes = {};
        mockNext = jest.fn();
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'test-secret';
    });

    describe('JWT token extraction from HttpOnly cookie', () => {
        it('should extract token from cookies', async () => {
            const token = jwt.sign({ userId: mockUser.id, email: mockUser.email }, 'test-secret');
            mockReq.cookies = { token };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            await authenticate(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith();
            expect(mockReq.user).toEqual(mockUser);
        });

        it('should extract token from Authorization header', async () => {
            const token = jwt.sign({ userId: mockUser.id, email: mockUser.email }, 'test-secret');
            mockReq.headers = { authorization: `Bearer ${token}` };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            await authenticate(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith();
            expect(mockReq.user).toEqual(mockUser);
        });

        it('should reject request with no token', async () => {
            await authenticate(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
            const error = (mockNext as jest.Mock).mock.calls[0][0];
            expect(error.statusCode).toBe(401);
        });
    });

    describe('JWT token signature validation', () => {
        it('should reject token with invalid signature', async () => {
            const token = jwt.sign({ userId: mockUser.id, email: mockUser.email }, 'wrong-secret');
            mockReq.cookies = { token };

            await authenticate(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
            const error = (mockNext as jest.Mock).mock.calls[0][0];
            expect(error.message).toContain('Invalid token');
        });

        it('should accept token with valid signature', async () => {
            const token = jwt.sign({ userId: mockUser.id, email: mockUser.email }, 'test-secret');
            mockReq.cookies = { token };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            await authenticate(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith();
        });
    });

    describe('JWT token expiry handling', () => {
        it('should reject expired token with 401', async () => {
            const token = jwt.sign(
                { userId: mockUser.id, email: mockUser.email },
                'test-secret',
                { expiresIn: '-1s' } // Already expired
            );
            mockReq.cookies = { token };

            await authenticate(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
            const error = (mockNext as jest.Mock).mock.calls[0][0];
            expect(error.statusCode).toBe(401);
            // Middleware may return 'Token expired' or 'Invalid token'
            expect(['Invalid token', 'Token expired']).toContain(error.message);
        });

        it('should accept non-expired token', async () => {
            const token = jwt.sign(
                { userId: mockUser.id, email: mockUser.email },
                'test-secret',
                { expiresIn: '1h' }
            );
            mockReq.cookies = { token };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            await authenticate(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith();
        });
    });

    describe('User validation', () => {
        it('should reject token for non-existent user', async () => {
            const token = jwt.sign({ userId: 'nonexistent', email: 'test@example.com' }, 'test-secret');
            mockReq.cookies = { token };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await authenticate(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
            const error = (mockNext as jest.Mock).mock.calls[0][0];
            expect(error.statusCode).toBe(401);
        });

        it('should reject token for inactive user', async () => {
            const token = jwt.sign({ userId: mockUser.id, email: mockUser.email }, 'test-secret');
            mockReq.cookies = { token };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({ ...mockUser, isActive: false });

            await authenticate(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
            const error = (mockNext as jest.Mock).mock.calls[0][0];
            expect(error.statusCode).toBe(403);
        });
    });
});
