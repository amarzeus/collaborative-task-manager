import { prisma } from '../lib/prisma.js';
import { CreateOrganizationDto } from '../dtos/index.js';
import { AppError } from '../lib/errors.js';
import { Organization } from '@prisma/client';

export class OrganizationService {
  /**
   * Create a new organization and make the creator a SUPER_ADMIN
   */
  async create(data: CreateOrganizationDto, userId: string): Promise<Organization> {
    // Check if slug is taken
    const existing = await prisma.organization.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new AppError('Organization slug already taken', 400);
    }

    // Transaction to create org and membership
    const result = await prisma.$transaction(async (tx: any) => {
      const org = await tx.organization.create({
        data: {
          name: data.name,
          slug: data.slug,
          plan: 'FREE',
        },
      });

      await tx.membership.create({
        data: {
          userId,
          organizationId: org.id,
          role: 'SUPER_ADMIN',
        },
      });

      return org;
    });

    return result;
  }

  /**
   * Get organization by ID with membership validation
   */
  async getById(orgId: string, userId: string): Promise<Organization> {
    const membership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: orgId,
        },
      },
    });

    if (!membership) {
      throw new AppError('You are not a member of this organization', 403);
    }

    await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        _count: {
          select: { memberships: true, teams: true },
        },
      },
    });

    // Check mapping - in schema it's memberships
    // Let's re-fetch safely
    const orgWithCounts = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        _count: {
          select: { memberships: true, teams: true },
        },
      },
    });

    if (!orgWithCounts) {
      throw new AppError('Organization not found', 404);
    }

    return orgWithCounts;
  }

  /**
   * Get all organizations for a user
   */
  async getUserOrganizations(userId: string): Promise<Organization[]> {
    const memberships = await prisma.membership.findMany({
      where: { userId },
      include: {
        organization: true,
      },
    });

    return memberships.map((m: any) => m.organization);
  }
}
