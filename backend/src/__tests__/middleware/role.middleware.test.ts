/**
 * Unit tests for Role Middleware
 * Tests RBAC enforcement, role hierarchy, and authorization guards
 */

import { Request, Response, NextFunction } from 'express';
import { Role, OrgRole, TeamRole } from '@prisma/client';

// Mock Prisma before imports
jest.mock('../../lib/prisma', () => ({
    prisma: {
        teamMembership: {
            findUnique: jest.fn(),
        },
    },
}));

import {
    requireRole,
    requireAdmin,
    requireManager,
    requireTeamLead,
    hasPermission,
    isRoleAtLeast,
    requireMinRole,
    isOrgRoleAtLeast,
    requireOrgRole,
    requireOrgManager,
    requireOrgAdmin,
    requireTeamLeader,
} from '../../middleware/role.middleware';
import { prisma } from '../../lib/prisma';

describe('Role Middleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = { params: {} };
        mockRes = {};
        mockNext = jest.fn();
    });

    describe('requireRole', () => {
        /**
         * Test 1: Allow access for valid role
         */
        it('should allow access when user has allowed role', () => {
            mockReq = { user: { id: 'user-1', role: Role.ADMIN } } as any;

            requireRole(Role.ADMIN, Role.SUPER_ADMIN)(
                mockReq as Request,
                mockRes as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith();
        });

        /**
         * Test 2: Deny access for unauthorized role
         */
        it('should deny access when user has unauthorized role', () => {
            mockReq = { user: { id: 'user-1', role: Role.USER } } as any;

            requireRole(Role.ADMIN)(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Insufficient permissions' })
            );
        });

        /**
         * Test 3: Deny access when no user
         */
        it('should deny access when no user on request', () => {
            mockReq = {};

            requireRole(Role.USER)(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Authentication required' })
            );
        });
    });

    describe('requireAdmin', () => {
        /**
         * Test 4: Allow ADMIN
         */
        it('should allow ADMIN role', () => {
            mockReq = { user: { id: 'user-1', role: Role.ADMIN } } as any;

            requireAdmin()(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith();
        });

        /**
         * Test 5: Allow SUPER_ADMIN
         */
        it('should allow SUPER_ADMIN role', () => {
            mockReq = { user: { id: 'user-1', role: Role.SUPER_ADMIN } } as any;

            requireAdmin()(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith();
        });

        /**
         * Test 6: Deny USER
         */
        it('should deny USER role', () => {
            mockReq = { user: { id: 'user-1', role: Role.USER } } as any;

            requireAdmin()(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Insufficient permissions' })
            );
        });
    });

    describe('requireManager', () => {
        /**
         * Test 7: Allow MANAGER
         */
        it('should allow MANAGER role', () => {
            mockReq = { user: { id: 'user-1', role: Role.MANAGER } } as any;

            requireManager()(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith();
        });

        /**
         * Test 8: Deny TEAM_LEAD
         */
        it('should deny TEAM_LEAD role', () => {
            mockReq = { user: { id: 'user-1', role: Role.TEAM_LEAD } } as any;

            requireManager()(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Insufficient permissions' })
            );
        });
    });

    describe('requireTeamLead', () => {
        /**
         * Test 9: Allow TEAM_LEAD
         */
        it('should allow TEAM_LEAD role', () => {
            mockReq = { user: { id: 'user-1', role: Role.TEAM_LEAD } } as any;

            requireTeamLead()(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith();
        });
    });

    describe('hasPermission', () => {
        /**
         * Test 10: Return true for matching role
         */
        it('should return true when role is in required roles', () => {
            expect(hasPermission(Role.ADMIN, [Role.ADMIN, Role.SUPER_ADMIN])).toBe(true);
        });

        /**
         * Test 11: Return false for non-matching role
         */
        it('should return false when role is not in required roles', () => {
            expect(hasPermission(Role.USER, [Role.ADMIN, Role.SUPER_ADMIN])).toBe(false);
        });
    });

    describe('isRoleAtLeast', () => {
        /**
         * Test 12: Higher role passes
         */
        it('should return true when user role is higher than required', () => {
            expect(isRoleAtLeast(Role.ADMIN, Role.MANAGER)).toBe(true);
        });

        /**
         * Test 13: Same role passes
         */
        it('should return true when user role equals required', () => {
            expect(isRoleAtLeast(Role.MANAGER, Role.MANAGER)).toBe(true);
        });

        /**
         * Test 14: Lower role fails
         */
        it('should return false when user role is lower than required', () => {
            expect(isRoleAtLeast(Role.USER, Role.MANAGER)).toBe(false);
        });

        /**
         * Test 15: Full hierarchy check
         */
        it('should respect full role hierarchy', () => {
            expect(isRoleAtLeast(Role.SUPER_ADMIN, Role.USER)).toBe(true);
            expect(isRoleAtLeast(Role.USER, Role.SUPER_ADMIN)).toBe(false);
        });
    });

    describe('requireMinRole', () => {
        /**
         * Test 16: Allow when role meets minimum
         */
        it('should allow when user role meets minimum', () => {
            mockReq = { user: { id: 'user-1', role: Role.MANAGER } } as any;

            requireMinRole(Role.TEAM_LEAD)(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith();
        });

        /**
         * Test 17: Deny when role below minimum
         */
        it('should deny when user role is below minimum', () => {
            mockReq = { user: { id: 'user-1', role: Role.USER } } as any;

            requireMinRole(Role.TEAM_LEAD)(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Insufficient permissions' })
            );
        });
    });

    describe('isOrgRoleAtLeast', () => {
        /**
         * Test 18: Org role hierarchy
         */
        it('should respect org role hierarchy', () => {
            expect(isOrgRoleAtLeast(OrgRole.SUPER_ADMIN, OrgRole.MEMBER)).toBe(true);
            expect(isOrgRoleAtLeast(OrgRole.MANAGER, OrgRole.MEMBER)).toBe(true);
            expect(isOrgRoleAtLeast(OrgRole.MEMBER, OrgRole.MANAGER)).toBe(false);
        });
    });

    describe('requireOrgRole', () => {
        /**
         * Test 19: Allow with sufficient org role
         */
        it('should allow when user has sufficient org role', () => {
            mockReq = {
                tenantScope: { organizationId: 'org-1', role: OrgRole.MANAGER },
            } as any;

            requireOrgRole(OrgRole.MEMBER)(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith();
        });

        /**
         * Test 20: Deny without tenant scope
         */
        it('should deny when no tenant scope', () => {
            mockReq = {};

            requireOrgRole(OrgRole.MEMBER)(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Organization context required' })
            );
        });

        /**
         * Test 21: Deny with insufficient org role
         */
        it('should deny when org role is insufficient', () => {
            mockReq = {
                tenantScope: { organizationId: 'org-1', role: OrgRole.MEMBER },
            } as any;

            requireOrgRole(OrgRole.SUPER_ADMIN)(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Insufficient organization permissions' })
            );
        });
    });

    describe('requireTeamLeader', () => {
        /**
         * Test 22: Allow team leader
         */
        it('should allow when user is team leader', async () => {
            mockReq = {
                user: { id: 'user-1' },
                params: { id: 'team-1' },
            } as any;

            (prisma.teamMembership.findUnique as jest.Mock).mockResolvedValue({
                role: TeamRole.LEADER,
            });

            await requireTeamLeader()(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith();
        });

        /**
         * Test 23: Deny non-leader
         */
        it('should deny when user is not team leader', async () => {
            mockReq = {
                user: { id: 'user-1' },
                params: { id: 'team-1' },
            } as any;

            (prisma.teamMembership.findUnique as jest.Mock).mockResolvedValue({
                role: TeamRole.MEMBER,
            });

            await requireTeamLeader()(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Only team leaders can perform this action' })
            );
        });

        /**
         * Test 24: Deny when no membership
         */
        it('should deny when user has no team membership', async () => {
            mockReq = {
                user: { id: 'user-1' },
                params: { id: 'team-1' },
            } as any;

            (prisma.teamMembership.findUnique as jest.Mock).mockResolvedValue(null);

            await requireTeamLeader()(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Only team leaders can perform this action' })
            );
        });

        /**
         * Test 25: Deny when no user
         */
        it('should deny when no user on request', async () => {
            mockReq = { params: { id: 'team-1' } };

            await requireTeamLeader()(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Authentication required' })
            );
        });
    });
});
