/**
 * Unit tests for Team Service
 * Tests team CRUD operations, membership management, and RBAC
 */

// Mock Prisma before imports
jest.mock('../../lib/prisma', () => ({
  prisma: {
    team: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    teamMembership: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
    membership: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

import { teamService } from '../../services/team.service';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../lib/errors';

describe('TeamService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockTeam = {
    id: 'team-1',
    name: 'Engineering',
    description: 'Engineering team',
    organizationId: 'org-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('create', () => {
    /**
     * Test 1: Successfully create a team
     */
    it('should create a team and add creator as LEADER', async () => {
      (prisma.team.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.$transaction as jest.Mock).mockImplementation(async (fn: any) => {
        const mockTx = {
          team: { create: jest.fn().mockResolvedValue(mockTeam) },
          teamMembership: { create: jest.fn().mockResolvedValue({}) },
        };
        return fn(mockTx);
      });

      const result = await teamService.create(
        { name: 'Engineering', description: 'Engineering team' },
        'org-1',
        'user-1'
      );

      expect(result).toEqual(mockTeam);
      expect(prisma.team.findFirst).toHaveBeenCalledWith({
        where: {
          organizationId: 'org-1',
          name: { equals: 'Engineering', mode: 'insensitive' },
        },
      });
    });

    /**
     * Test 2: Throw error for duplicate team name
     */
    it('should throw error when team name already exists', async () => {
      (prisma.team.findFirst as jest.Mock).mockResolvedValue(mockTeam);

      await expect(
        teamService.create({ name: 'Engineering', description: 'Duplicate' }, 'org-1', 'user-1')
      ).rejects.toThrow(AppError);
    });
  });

  describe('getById', () => {
    /**
     * Test 3: Return team when found
     */
    it('should return team when found in organization', async () => {
      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);

      const result = await teamService.getById('team-1', 'org-1');

      expect(result).toEqual(mockTeam);
    });

    /**
     * Test 4: Throw error when team not found
     */
    it('should throw 404 when team not found', async () => {
      (prisma.team.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(teamService.getById('non-existent', 'org-1')).rejects.toThrow(AppError);
    });

    /**
     * Test 5: Throw error when team belongs to different org
     */
    it('should throw 404 when team belongs to different organization', async () => {
      (prisma.team.findUnique as jest.Mock).mockResolvedValue({
        ...mockTeam,
        organizationId: 'org-2',
      });

      await expect(teamService.getById('team-1', 'org-1')).rejects.toThrow(AppError);
    });
  });

  describe('list', () => {
    /**
     * Test 6: List all teams in organization
     */
    it('should return all teams in organization', async () => {
      const teams = [mockTeam, { ...mockTeam, id: 'team-2', name: 'Design' }];
      (prisma.team.findMany as jest.Mock).mockResolvedValue(teams);

      const result = await teamService.list('org-1', 'user-1');

      expect(result).toEqual(teams);
      expect(prisma.team.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { organizationId: 'org-1' },
        })
      );
    });
  });

  describe('update', () => {
    /**
     * Test 7: Successfully update team
     */
    it('should update team name and description', async () => {
      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.team.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.team.update as jest.Mock).mockResolvedValue({
        ...mockTeam,
        name: 'Updated Team',
      });

      const result = await teamService.update('team-1', { name: 'Updated Team' }, 'org-1');

      expect(result.name).toBe('Updated Team');
    });

    /**
     * Test 8: Throw error when updating to existing name
     */
    it('should throw error when updating to existing team name', async () => {
      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.team.findFirst as jest.Mock).mockResolvedValue({
        id: 'team-2',
        name: 'Existing Team',
      });

      await expect(
        teamService.update('team-1', { name: 'Existing Team' }, 'org-1')
      ).rejects.toThrow(AppError);
    });
  });

  describe('delete', () => {
    /**
     * Test 9: Successfully delete team
     */
    it('should delete team', async () => {
      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.team.delete as jest.Mock).mockResolvedValue({});

      await expect(teamService.delete('team-1', 'org-1')).resolves.not.toThrow();
    });
  });

  describe('addMember', () => {
    /**
     * Test 10: Successfully add member as team leader
     */
    it('should add member when caller is team leader', async () => {
      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.teamMembership.findUnique as jest.Mock)
        .mockResolvedValueOnce({ role: 'LEADER' }) // caller check
        .mockResolvedValueOnce(null); // new member check
      (prisma.membership.findUnique as jest.Mock).mockResolvedValue({ userId: 'user-2' });
      (prisma.teamMembership.create as jest.Mock).mockResolvedValue({
        userId: 'user-2',
        teamId: 'team-1',
        role: 'MEMBER',
      });

      const result = await teamService.addMember('team-1', 'user-2', 'MEMBER', 'org-1', 'leader-1');

      expect(result).toBeDefined();
    });

    /**
     * Test 11: Throw error when non-leader tries to add member
     */
    it('should throw 403 when non-leader tries to add member', async () => {
      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.teamMembership.findUnique as jest.Mock).mockResolvedValue({ role: 'MEMBER' });

      await expect(
        teamService.addMember('team-1', 'user-2', 'MEMBER', 'org-1', 'non-leader')
      ).rejects.toThrow(AppError);
    });

    /**
     * Test 12: Throw error when user not in organization
     */
    it('should throw 400 when user not in organization', async () => {
      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.teamMembership.findUnique as jest.Mock).mockResolvedValue({ role: 'LEADER' });
      (prisma.membership.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        teamService.addMember('team-1', 'outsider', 'MEMBER', 'org-1', 'leader-1')
      ).rejects.toThrow(AppError);
    });

    /**
     * Test 13: Throw error when user already in team
     */
    it('should throw 400 when user already in team', async () => {
      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.teamMembership.findUnique as jest.Mock)
        .mockResolvedValueOnce({ role: 'LEADER' }) // caller check
        .mockResolvedValueOnce({ userId: 'user-2' }); // already exists
      (prisma.membership.findUnique as jest.Mock).mockResolvedValue({ userId: 'user-2' });

      await expect(
        teamService.addMember('team-1', 'user-2', 'MEMBER', 'org-1', 'leader-1')
      ).rejects.toThrow(AppError);
    });
  });

  describe('removeMember', () => {
    /**
     * Test 14: Successfully remove member as leader
     */
    it('should remove member when caller is team leader', async () => {
      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.teamMembership.findUnique as jest.Mock)
        .mockResolvedValueOnce({ role: 'LEADER' }) // caller check
        .mockResolvedValueOnce({ userId: 'user-2' }); // member exists
      (prisma.teamMembership.delete as jest.Mock).mockResolvedValue({});

      await expect(
        teamService.removeMember('team-1', 'user-2', 'org-1', 'leader-1')
      ).resolves.not.toThrow();
    });

    /**
     * Test 15: Throw error when non-leader tries to remove
     */
    it('should throw 403 when non-leader tries to remove member', async () => {
      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.teamMembership.findUnique as jest.Mock).mockResolvedValue({ role: 'MEMBER' });

      await expect(
        teamService.removeMember('team-1', 'user-2', 'org-1', 'non-leader')
      ).rejects.toThrow(AppError);
    });

    /**
     * Test 16: Throw error when member not found
     */
    it('should throw 404 when member not found', async () => {
      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.teamMembership.findUnique as jest.Mock)
        .mockResolvedValueOnce({ role: 'LEADER' }) // caller check
        .mockResolvedValueOnce(null); // member not found

      await expect(
        teamService.removeMember('team-1', 'non-member', 'org-1', 'leader-1')
      ).rejects.toThrow(AppError);
    });
  });

  describe('updateMemberRole', () => {
    /**
     * Test 17: Successfully update member role
     */
    it('should update member role when caller is leader', async () => {
      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.teamMembership.findUnique as jest.Mock)
        .mockResolvedValueOnce({ role: 'LEADER' }) // caller check
        .mockResolvedValueOnce({ userId: 'user-2', role: 'MEMBER' }); // member exists
      (prisma.teamMembership.update as jest.Mock).mockResolvedValue({
        userId: 'user-2',
        role: 'LEADER',
      });

      const result = await teamService.updateMemberRole(
        'team-1',
        'user-2',
        'LEADER',
        'org-1',
        'leader-1'
      );

      expect(result.role).toBe('LEADER');
    });

    /**
     * Test 18: Throw error when non-leader tries to update role
     */
    it('should throw 403 when non-leader tries to update role', async () => {
      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.teamMembership.findUnique as jest.Mock).mockResolvedValue({ role: 'MEMBER' });

      await expect(
        teamService.updateMemberRole('team-1', 'user-2', 'LEADER', 'org-1', 'non-leader')
      ).rejects.toThrow(AppError);
    });
  });
});
