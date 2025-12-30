/**
 * Unit tests for Tenant Middleware
 * Tests multi-tenancy context injection and organization validation
 */

import { Request, Response, NextFunction } from 'express';
import { tenantMiddleware } from '../../middleware/tenant.middleware';
import { prisma } from '../../lib/prisma';

// Mock Prisma before imports
jest.mock('../../lib/prisma', () => ({
    prisma: {
        membership: {
            findUnique: jest.fn(),
        },
    },
}));

describe('Tenant Middleware', () => {
    let mockReq: Partial<Request> & { user?: any; tenantScope?: any; params?: any };
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = {
            headers: {},
            params: {},
            user: { id: 'user-1', email: 'test@example.com', role: 'USER' },
        };
        mockRes = {};
        mockNext = jest.fn();
    });

    /**
     * Test 1: Set tenant scope from header
     */
    it('should set tenant scope from x-organization-id header', async () => {
        mockReq.headers = { 'x-organization-id': 'org-1' };
        mockReq.user = { id: 'user-1', email: 'test@example.com', role: 'USER' };

        (prisma.membership.findUnique as jest.Mock).mockResolvedValue({
            organizationId: 'org-1',
            role: 'MEMBER',
        });

        await tenantMiddleware(mockReq as Request, mockRes as Response, mockNext);

        expect(mockReq.tenantScope).toBeDefined();
        expect(mockReq.tenantScope.organizationId).toBe('org-1');
        expect(mockNext).toHaveBeenCalledWith();
    });

    /**
     * Test 2: Deny access when user not in organization
     */
    it('should deny access when user is not a member of organization', async () => {
        mockReq.headers = { 'x-organization-id': 'org-1' };
        mockReq.user = { id: 'user-1', email: 'test@example.com', role: 'USER' };

        (prisma.membership.findUnique as jest.Mock).mockResolvedValue(null);

        await tenantMiddleware(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({ statusCode: 403 })
        );
    });

    /**
     * Test 3: Allow individual mode (no org header)
     */
    it('should allow individual mode when no organization header', async () => {
        mockReq.headers = {};
        mockReq.user = { id: 'user-1', email: 'test@example.com', role: 'USER' };

        await tenantMiddleware(mockReq as Request, mockRes as Response, mockNext);

        expect(mockReq.tenantScope).toBeUndefined();
        expect(mockNext).toHaveBeenCalledWith();
    });

    /**
     * Test 4: Include org role in tenant scope
     */
    it('should include organization role in tenant scope', async () => {
        mockReq.headers = { 'x-organization-id': 'org-1' };
        mockReq.user = { id: 'user-1', email: 'test@example.com', role: 'USER' };

        (prisma.membership.findUnique as jest.Mock).mockResolvedValue({
            organizationId: 'org-1',
            role: 'MANAGER',
        });

        await tenantMiddleware(mockReq as Request, mockRes as Response, mockNext);

        expect(mockReq.tenantScope.role).toBe('MANAGER');
    });

    /**
     * Test 5: Skip membership check when no user (public routes)
     * The tenant middleware allows requests without org header to pass through
     */
    it('should pass through when no org header and no user', async () => {
        mockReq.headers = {};
        delete mockReq.user;

        await tenantMiddleware(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
    });

    /**
     * Test 6: Handle database errors gracefully
     */
    it('should handle database errors gracefully', async () => {
        mockReq.headers = { 'x-organization-id': 'org-1' };
        mockReq.user = { id: 'user-1', email: 'test@example.com', role: 'USER' };

        (prisma.membership.findUnique as jest.Mock).mockRejectedValue(
            new Error('Database connection failed')
        );

        await tenantMiddleware(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    /**
     * Test 7: Extract org ID from params
     */
    it('should extract organization ID from route params', async () => {
        mockReq.headers = {};
        mockReq.params = { orgId: 'org-2' };
        mockReq.user = { id: 'user-1', email: 'test@example.com', role: 'USER' };

        (prisma.membership.findUnique as jest.Mock).mockResolvedValue({
            organizationId: 'org-2',
            role: 'MEMBER',
        });

        await tenantMiddleware(mockReq as Request, mockRes as Response, mockNext);

        expect(mockReq.tenantScope.organizationId).toBe('org-2');
    });
});
