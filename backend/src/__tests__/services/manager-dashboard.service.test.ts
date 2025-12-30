/**
 * Unit tests for Manager Dashboard Service
 * Tests cross-team analytics and organization-wide metrics
 */

// Mock Prisma before imports
jest.mock('../../lib/prisma', () => ({
    prisma: {
        team: {
            count: jest.fn(),
            findMany: jest.fn(),
        },
        membership: {
            count: jest.fn(),
        },
        task: {
            groupBy: jest.fn(),
            count: jest.fn(),
            findMany: jest.fn(),
        },
        taskHistory: {
            findMany: jest.fn(),
            groupBy: jest.fn(),
        },
        user: {
            findUnique: jest.fn(),
        },
    },
}));

import { managerDashboardService } from '../../services/manager-dashboard.service';
import { prisma } from '../../lib/prisma';

describe('ManagerDashboardService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const orgId = 'org-1';

    describe('getOrgOverview', () => {
        /**
         * Test 1: Return organization overview
         */
        it('should return organization overview with counts', async () => {
            (prisma.team.count as jest.Mock).mockResolvedValue(5);
            (prisma.membership.count as jest.Mock).mockResolvedValue(25);
            (prisma.task.groupBy as jest.Mock).mockResolvedValue([
                { status: 'TODO', _count: 10 },
                { status: 'IN_PROGRESS', _count: 8 },
                { status: 'COMPLETED', _count: 20 },
            ]);

            const result = await managerDashboardService.getOrgOverview(orgId);

            expect(result.teamCount).toBe(5);
            expect(result.memberCount).toBe(25);
            expect(result.taskStats.TODO).toBe(10);
            expect(result.totalTasks).toBe(38);
        });

        /**
         * Test 2: Calculate organization completion rate
         */
        it('should calculate org completion rate correctly', async () => {
            (prisma.team.count as jest.Mock).mockResolvedValue(2);
            (prisma.membership.count as jest.Mock).mockResolvedValue(10);
            (prisma.task.groupBy as jest.Mock).mockResolvedValue([
                { status: 'TODO', _count: 25 },
                { status: 'COMPLETED', _count: 75 },
            ]);

            const result = await managerDashboardService.getOrgOverview(orgId);

            expect(result.completionRate).toBe(75); // 75/100 * 100
        });

        /**
         * Test 3: Handle empty organization
         */
        it('should handle organization with no tasks', async () => {
            (prisma.team.count as jest.Mock).mockResolvedValue(1);
            (prisma.membership.count as jest.Mock).mockResolvedValue(3);
            (prisma.task.groupBy as jest.Mock).mockResolvedValue([]);

            const result = await managerDashboardService.getOrgOverview(orgId);

            expect(result.totalTasks).toBe(0);
            expect(result.completionRate).toBe(0);
        });
    });

    describe('getTeamComparison', () => {
        /**
         * Test 4: Return team comparison data
         */
        it('should return all teams with performance stats', async () => {
            (prisma.team.findMany as jest.Mock).mockResolvedValue([
                { id: 'team-1', name: 'Engineering', _count: { memberships: 5 } },
                { id: 'team-2', name: 'Design', _count: { memberships: 3 } },
            ]);
            (prisma.task.count as jest.Mock)
                .mockResolvedValueOnce(20)  // team-1 total
                .mockResolvedValueOnce(15)  // team-1 completed
                .mockResolvedValueOnce(3)   // team-1 in progress
                .mockResolvedValueOnce(2)   // team-1 overdue
                .mockResolvedValueOnce(10)  // team-2 total
                .mockResolvedValueOnce(5)   // team-2 completed
                .mockResolvedValueOnce(2)   // team-2 in progress
                .mockResolvedValueOnce(1);  // team-2 overdue

            const result = await managerDashboardService.getTeamComparison(orgId);

            expect(result).toHaveLength(2);
            expect(result[0].stats.completionRate).toBeGreaterThanOrEqual(result[1].stats.completionRate);
        });

        /**
         * Test 5: Sort teams by completion rate
         */
        it('should sort teams by completion rate (highest first)', async () => {
            (prisma.team.findMany as jest.Mock).mockResolvedValue([
                { id: 'team-1', name: 'Low Performer', _count: { memberships: 2 } },
                { id: 'team-2', name: 'High Performer', _count: { memberships: 4 } },
            ]);
            (prisma.task.count as jest.Mock)
                .mockResolvedValueOnce(10)  // team-1 total
                .mockResolvedValueOnce(2)   // team-1 completed (20%)
                .mockResolvedValueOnce(3)
                .mockResolvedValueOnce(5)
                .mockResolvedValueOnce(10)  // team-2 total
                .mockResolvedValueOnce(8)   // team-2 completed (80%)
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(0);

            const result = await managerDashboardService.getTeamComparison(orgId);

            expect(result[0].name).toBe('High Performer');
            expect(result[1].name).toBe('Low Performer');
        });
    });

    describe('getOrgTrends', () => {
        /**
         * Test 6: Return organization trends
         */
        it('should return 14-day completion trends', async () => {
            (prisma.taskHistory.findMany as jest.Mock).mockResolvedValue([
                { createdAt: new Date() },
                { createdAt: new Date(Date.now() - 86400000 * 2) },
            ]);

            const result = await managerDashboardService.getOrgTrends(orgId, 14);

            expect(result).toHaveLength(14);
            expect(result[0]).toHaveProperty('date');
            expect(result[0]).toHaveProperty('completed');
        });

        /**
         * Test 7: Handle no completions
         */
        it('should handle no completions in period', async () => {
            (prisma.taskHistory.findMany as jest.Mock).mockResolvedValue([]);

            const result = await managerDashboardService.getOrgTrends(orgId, 7);

            expect(result).toHaveLength(7);
            result.forEach(day => expect(day.completed).toBe(0));
        });
    });

    describe('getTopPerformers', () => {
        /**
         * Test 8: Return top performers
         */
        it('should return top performers by completed tasks', async () => {
            (prisma.taskHistory.groupBy as jest.Mock).mockResolvedValue([
                { userId: 'user-1', _count: 15 },
                { userId: 'user-2', _count: 10 },
            ]);
            (prisma.user.findUnique as jest.Mock)
                .mockResolvedValueOnce({ id: 'user-1', name: 'Top Performer', email: 'top@test.com' })
                .mockResolvedValueOnce({ id: 'user-2', name: 'Second Best', email: 'second@test.com' });

            const result = await managerDashboardService.getTopPerformers(orgId, 10);

            expect(result).toHaveLength(2);
            expect(result[0].user?.name).toBe('Top Performer');
            expect(result[0].completedTasks).toBe(15);
        });

        /**
         * Test 9: Respect limit parameter
         */
        it('should respect the limit parameter', async () => {
            (prisma.taskHistory.groupBy as jest.Mock).mockResolvedValue([
                { userId: 'user-1', _count: 20 },
            ]);
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-1', name: 'User' });

            await managerDashboardService.getTopPerformers(orgId, 5);

            expect(prisma.taskHistory.groupBy).toHaveBeenCalledWith(
                expect.objectContaining({ take: 5 })
            );
        });
    });

    describe('getPriorityDistribution', () => {
        /**
         * Test 10: Return priority distribution
         */
        it('should return task count by priority', async () => {
            (prisma.task.findMany as jest.Mock).mockResolvedValue([
                { priority: 'LOW' },
                { priority: 'LOW' },
                { priority: 'MEDIUM' },
                { priority: 'HIGH' },
                { priority: 'HIGH' },
                { priority: 'HIGH' },
                { priority: 'URGENT' },
            ]);

            const result = await managerDashboardService.getPriorityDistribution(orgId);

            expect(result.low).toBe(2);
            expect(result.medium).toBe(1);
            expect(result.high).toBe(3);
            expect(result.urgent).toBe(1);
        });

        /**
         * Test 11: Handle no tasks
         */
        it('should handle no tasks', async () => {
            (prisma.task.findMany as jest.Mock).mockResolvedValue([]);

            const result = await managerDashboardService.getPriorityDistribution(orgId);

            expect(result.low).toBe(0);
            expect(result.medium).toBe(0);
            expect(result.high).toBe(0);
            expect(result.urgent).toBe(0);
        });
    });
});
