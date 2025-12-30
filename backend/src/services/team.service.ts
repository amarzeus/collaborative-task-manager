
import { prisma } from '../lib/prisma.js';
import { CreateTeamDto, UpdateTeamDto } from '../dtos/index.js';
import { AppError } from '../lib/errors.js';
import { Team } from '@prisma/client';

export const teamService = {
    /**
     * Create a new team within an organization
     */
    async create(data: CreateTeamDto, organizationId: string, creatorId: string): Promise<Team> {
        // Check if team name exists in this org
        const existing = await prisma.team.findFirst({
            where: {
                organizationId,
                name: { equals: data.name, mode: 'insensitive' },
            },
        });

        if (existing) {
            throw new AppError('Team with this name already exists in the organization', 400);
        }

        // Create team and add creator as LEADER
        const result = await prisma.$transaction(async (tx: any) => {
            const team = await tx.team.create({
                data: {
                    name: data.name,
                    description: data.description,
                    organizationId,
                },
            });

            await tx.teamMembership.create({
                data: {
                    teamId: team.id,
                    userId: creatorId,
                    role: 'LEADER',
                },
            });

            return team;
        });

        return result;
    },

    /**
     * Get team by ID
     */
    async getById(id: string, organizationId: string): Promise<Team> {
        const team = await prisma.team.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { memberships: true },
                },
            },
        });

        if (!team || team.organizationId !== organizationId) {
            throw new AppError('Team not found', 404);
        }

        return team;
    },

    /**
     * List teams in an organization
     */
    async list(organizationId: string, userId: string): Promise<Team[]> {
        // List all teams the user is part of, OR all teams if they have permission to see them?
        // For now, listing all visible teams in organization.
        return prisma.team.findMany({
            where: { organizationId },
            include: {
                _count: {
                    select: { memberships: true },
                },
            },
            orderBy: { name: 'asc' },
        });
    },

    /**
     * Update team
     */
    async update(id: string, data: UpdateTeamDto, organizationId: string): Promise<Team> {
        const team = await this.getById(id, organizationId);

        if (data.name) {
            const existing = await prisma.team.findFirst({
                where: {
                    organizationId,
                    name: { equals: data.name, mode: 'insensitive' },
                    id: { not: id },
                },
            });

            if (existing) {
                throw new AppError('Team with this name already exists', 400);
            }
        }

        return prisma.team.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
            },
        });
    },

    /**
     * Delete team
     */
    async delete(id: string, organizationId: string): Promise<void> {
        await this.getById(id, organizationId);
        await prisma.team.delete({ where: { id } });
    },

    /**
     * Add member to team
     */
    async addMember(teamId: string, userId: string, role: any, organizationId: string, callerId?: string): Promise<any> {
        const team = await this.getById(teamId, organizationId);

        // Check if caller is Team Leader (RBAC)
        if (callerId) {
            const callerMembership = await prisma.teamMembership.findUnique({
                where: {
                    userId_teamId: {
                        userId: callerId,
                        teamId,
                    },
                },
            });

            if (!callerMembership || callerMembership.role !== 'LEADER') {
                throw new AppError('Only team leaders can manage team membership', 403);
            }
        }

        // Verify user is in organization
        const orgMembership = await prisma.membership.findUnique({
            where: {
                userId_organizationId: {
                    userId,
                    organizationId,
                },
            },
        });

        if (!orgMembership) {
            throw new AppError('User is not a member of the organization', 400);
        }

        // Check if already in team
        const existing = await prisma.teamMembership.findUnique({
            where: {
                userId_teamId: {
                    userId,
                    teamId,
                },
            },
        });

        if (existing) {
            throw new AppError('User is already a member of this team', 400);
        }

        return prisma.teamMembership.create({
            data: {
                teamId,
                userId,
                role,
            },
            include: { user: true },
        });
    },

    /**
     * Remove member from team
     */
    async removeMember(teamId: string, userId: string, organizationId: string, callerId?: string): Promise<void> {
        await this.getById(teamId, organizationId);

        // Check if caller is Team Leader (RBAC)
        if (callerId) {
            const callerMembership = await prisma.teamMembership.findUnique({
                where: {
                    userId_teamId: {
                        userId: callerId,
                        teamId,
                    },
                },
            });

            if (!callerMembership || callerMembership.role !== 'LEADER') {
                throw new AppError('Only team leaders can manage team membership', 403);
            }
        }

        // Check if member exists
        const membership = await prisma.teamMembership.findUnique({
            where: {
                userId_teamId: {
                    userId,
                    teamId,
                },
            },
        });

        if (!membership) {
            throw new AppError('User is not a member of this team', 404);
        }

        await prisma.teamMembership.delete({
            where: {
                userId_teamId: {
                    userId,
                    teamId,
                },
            },
        });
    },

    /**
     * Update member role
     */
    async updateMemberRole(teamId: string, userId: string, role: any, organizationId: string, callerId?: string): Promise<any> {
        await this.getById(teamId, organizationId);

        // Check if caller is Team Leader (RBAC)
        if (callerId) {
            const callerMembership = await prisma.teamMembership.findUnique({
                where: {
                    userId_teamId: {
                        userId: callerId,
                        teamId,
                    },
                },
            });

            if (!callerMembership || callerMembership.role !== 'LEADER') {
                throw new AppError('Only team leaders can manage team membership', 403);
            }
        }

        const membership = await prisma.teamMembership.findUnique({
            where: {
                userId_teamId: {
                    userId,
                    teamId,
                },
            },
        });

        if (!membership) {
            throw new AppError('User is not a member of this team', 404);
        }

        return prisma.teamMembership.update({
            where: {
                userId_teamId: {
                    userId,
                    teamId,
                },
            },
            data: { role },
            include: { user: true },
        });
    },
};
