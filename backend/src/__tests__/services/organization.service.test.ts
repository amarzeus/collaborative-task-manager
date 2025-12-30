/**
 * Unit tests for Organization Service
 * Tests organization CRUD and membership validation
 */

// Mock Prisma before imports
jest.mock('../../lib/prisma', () => ({
  prisma: {
    organization: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    membership: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

import { OrganizationService } from '../../services/organization.service';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../lib/errors';

describe('OrganizationService', () => {
  let organizationService: OrganizationService;

  beforeEach(() => {
    jest.clearAllMocks();
    organizationService = new OrganizationService();
  });

  const mockOrg = {
    id: 'org-1',
    name: 'Test Organization',
    slug: 'test-org',
    plan: 'FREE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('create', () => {
    /**
     * Test 1: Successfully create organization
     */
    it('should create organization and add creator as SUPER_ADMIN', async () => {
      (prisma.organization.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.$transaction as jest.Mock).mockImplementation(async (fn: any) => {
        const mockTx = {
          organization: { create: jest.fn().mockResolvedValue(mockOrg) },
          membership: { create: jest.fn().mockResolvedValue({}) },
        };
        return fn(mockTx);
      });

      const result = await organizationService.create(
        { name: 'Test Organization', slug: 'test-org' },
        'user-1'
      );

      expect(result).toEqual(mockOrg);
    });

    /**
     * Test 2: Throw error for duplicate slug
     */
    it('should throw error when slug already exists', async () => {
      (prisma.organization.findUnique as jest.Mock).mockResolvedValue(mockOrg);

      await expect(
        organizationService.create({ name: 'Another Org', slug: 'test-org' }, 'user-1')
      ).rejects.toThrow(AppError);
    });
  });

  describe('getById', () => {
    /**
     * Test 3: Return organization when user is member
     */
    it('should return organization when user is member', async () => {
      (prisma.membership.findUnique as jest.Mock).mockResolvedValue({
        organizationId: 'org-1',
        role: 'MEMBER',
      });
      (prisma.organization.findUnique as jest.Mock).mockResolvedValue(mockOrg);

      const result = await organizationService.getById('org-1', 'user-1');

      expect(result).toEqual(mockOrg);
    });

    /**
     * Test 4: Throw 403 when user not a member
     */
    it('should throw 403 when user is not a member', async () => {
      (prisma.membership.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(organizationService.getById('org-1', 'non-member')).rejects.toThrow(AppError);
    });

    /**
     * Test 5: Throw 404 when org not found
     */
    it('should throw 404 when organization not found', async () => {
      (prisma.membership.findUnique as jest.Mock).mockResolvedValue({
        organizationId: 'org-1',
        role: 'MEMBER',
      });
      (prisma.organization.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(organizationService.getById('non-existent', 'user-1')).rejects.toThrow(AppError);
    });
  });

  describe('getUserOrganizations', () => {
    /**
     * Test 6: Return all user organizations
     */
    it('should return all organizations for user', async () => {
      const memberships = [
        { organization: mockOrg },
        { organization: { ...mockOrg, id: 'org-2', name: 'Org 2' } },
      ];
      (prisma.membership.findMany as jest.Mock).mockResolvedValue(memberships);

      const result = await organizationService.getUserOrganizations('user-1');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockOrg);
    });

    /**
     * Test 7: Return empty array when no memberships
     */
    it('should return empty array when user has no organizations', async () => {
      (prisma.membership.findMany as jest.Mock).mockResolvedValue([]);

      const result = await organizationService.getUserOrganizations('user-1');

      expect(result).toEqual([]);
    });
  });
});
