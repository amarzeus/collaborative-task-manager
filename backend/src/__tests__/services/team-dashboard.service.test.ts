/**
 * Unit tests for Team Dashboard Service
 * Tests team-scoped analytics and task management
 */

// Mock Prisma before imports
jest.mock('../../lib/prisma', () => ({
    prisma: {
        team: {
            findUnique: jest.fn(),
        },
        teamMembership: {
            count: jest.fn(),
            findMany: jest.fn(),
        },
        task: {
            groupBy: jest.fn(),
            count: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
        },
        taskHistory: {
            findMany: jest.fn(),
        },
    },
}));

import { teamDashboardService } from '../../services/team-dashboard.service';
import { prisma } from '../../lib/prisma';

describe('TeamDashboardService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const teamId = 'team-1';

    describe('getTeamOverview', () => {
        /**
         * Test 1: Return team overview with stats
         */
        it('should return team overview with task stats', async () => {
            (prisma.team.findUnique as jest.Mock).mockResolvedValue({
                id: teamId,
                name: 'Engineering',
            });
            (prisma.teamMembership.count as jest.Mock).mockResolvedValue(5);
            (prisma.task.groupBy as jest.Mock).mockResolvedValue([
                { status: 'TODO', _count: 3 },
                { status: 'COMPLETED', _count: 7 },
            ]);

            const result = await teamDashboardService.getTeamOverview(teamId);

            expect(result.team).toBeDefined();
            expect(result.memberCount).toBe(5);
            expect(result.taskStats.TODO).toBe(3);
            expect(result.taskStats.COMPLETED).toBe(7);
        });

        /**
         * Test 2: Calculate completion rate correctly
         */
        it('should calculate completion rate correctly', async () => {
            (prisma.team.findUnique as jest.Mock).mockResolvedValue({ id: teamId });
            (prisma.teamMembership.count as jest.Mock).mockResolvedValue(3);
            (prisma.task.groupBy as jest.Mock).mockResolvedValue([
                { status: 'TODO', _count: 2 },
                { status: 'COMPLETED', _count: 8 },
            ]);

            const result = await teamDashboardService.getTeamOverview(teamId);

            expect(result.completionRate).toBe(80); // 8/10 * 100
        });

        /**
         * Test 3: Handle zero tasks
         */
        it('should handle zero tasks gracefully', async () => {
            (prisma.team.findUnique as jest.Mock).mockResolvedValue({ id: teamId });
            (prisma.teamMembership.count as jest.Mock).mockResolvedValue(2);
            (prisma.task.groupBy as jest.Mock).mockResolvedValue([]);

            const result = await teamDashboardService.getTeamOverview(teamId);

            expect(result.totalTasks).toBe(0);
            expect(result.completionRate).toBe(0);
        });
    });

    describe('getMemberPerformance', () => {
        /**
         * Test 4: Return member performance stats
         */
        it('should return performance stats for all members', async () => {
            (prisma.teamMembership.findMany as jest.Mock).mockResolvedValue([
                { userId: 'user-1', user: { id: 'user-1', name: 'Alice' }, role: 'LEADER' },
                { userId: 'user-2', user: { id: 'user-2', name: 'Bob' }, role: 'MEMBER' },
            ]);
            (prisma.task.count as jest.Mock)
                .mockResolvedValueOnce(10) // user-1 assigned
                .mockResolvedValueOnce(7)  // user-1 completed
                .mockResolvedValueOnce(2)  // user-1 in progress
                .mockResolvedValueOnce(5)  // user-2 assigned
                .mockResolvedValueOnce(3)  // user-2 completed
                .mockResolvedValueOnce(1); // user-2 in progress

            const result = await teamDashboardService.getMemberPerformance(teamId);

            expect(result).toHaveLength(2);
            expect(result[0].user.name).toBe('Alice');
            expect(result[0].stats.assigned).toBe(10);
            expect(result[0].stats.completionRate).toBe(70);
        });

        /**
         * Test 5: Handle member with no tasks
         */
        it('should handle member with no assigned tasks', async () => {
            (prisma.teamMembership.findMany as jest.Mock).mockResolvedValue([
                { userId: 'user-1', user: { id: 'user-1', name: 'New Member' }, role: 'MEMBER' },
            ]);
            (prisma.task.count as jest.Mock).mockResolvedValue(0);

            const result = await teamDashboardService.getMemberPerformance(teamId);

            expect(result[0].stats.completionRate).toBe(0);
        });
    });

    describe('getTeamTasks', () => {
        /**
         * Test 6: Return all team tasks
         */
        it('should return all team tasks', async () => {
            const mockTasks = [{ id: 'task-1' }, { id: 'task-2' }];
            (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

            const result = await teamDashboardService.getTeamTasks(teamId);

            expect(result).toEqual(mockTasks);
        });

        /**
         * Test 7: Filter by status
         */
        it('should filter tasks by status', async () => {
            (prisma.task.findMany as jest.Mock).mockResolvedValue([]);

            await teamDashboardService.getTeamTasks(teamId, 'TODO');

            expect(prisma.task.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { teamId, status: 'TODO' },
                })
            );
        });
    });

    describe('getTeamTrends', () => {
        /**
         * Test 8: Return completion trends
         */
        it('should return 7-day completion trends', async () => {
            (prisma.taskHistory.findMany as jest.Mock).mockResolvedValue([
                { createdAt: new Date() },
                { createdAt: new Date(Date.now() - 86400000) },
            ]);

            const result = await teamDashboardService.getTeamTrends(teamId, 7);

            expect(result).toHaveLength(7);
            expect(result[0]).toHaveProperty('date');
            expect(result[0]).toHaveProperty('completed');
        });
    });

    describe('getUnassignedTasks', () => {
        /**
         * Test 9: Return unassigned tasks
         */
        it('should return unassigned incomplete tasks', async () => {
            const mockTasks = [{ id: 'task-1', assignedToId: null }];
            (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

            const result = await teamDashboardService.getUnassignedTasks(teamId);

            expect(result).toEqual(mockTasks);
            expect(prisma.task.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        teamId,
                        assignedToId: null,
                        status: { not: 'COMPLETED' },
                    },
                })
            );
        });
    });

    describe('assignTask', () => {
        /**
         * Test 10: Assign task to member
         */
        it('should assign task to team member', async () => {
            const updatedTask = { id: 'task-1', assignedToId: 'user-2' };
            (prisma.task.update as jest.Mock).mockResolvedValue(updatedTask);

            const result = await teamDashboardService.assignTask('task-1', 'user-2', 'leader-1');

            expect(result.assignedToId).toBe('user-2');
            expect(prisma.task.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'task-1' },
                    data: { assignedToId: 'user-2' },
                })
            );
        });
    });
});
