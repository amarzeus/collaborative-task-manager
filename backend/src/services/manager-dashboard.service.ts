/**
 * Manager Dashboard Service
 * Cross-team analytics for Managers
 */

import { prisma } from '../lib/prisma.js';

export const managerDashboardService = {
    /**
     * Get organization overview for managers
     */
    async getOrgOverview(organizationId: string) {
        const [teamCount, memberCount, taskStats] = await Promise.all([
            prisma.team.count({ where: { organizationId } }),
            prisma.membership.count({ where: { organizationId } }),
            prisma.task.groupBy({
                by: ['status'],
                where: { organizationId },
                _count: true,
            }),
        ]);

        const statusCounts: Record<string, number> = {
            TODO: 0,
            IN_PROGRESS: 0,
            REVIEW: 0,
            COMPLETED: 0,
        };
        taskStats.forEach((s: any) => {
            statusCounts[s.status] = s._count;
        });

        const totalTasks = Object.values(statusCounts).reduce((a, b) => a + b, 0);

        return {
            teamCount,
            memberCount,
            taskStats: statusCounts,
            totalTasks,
            completionRate: totalTasks > 0
                ? Math.round((statusCounts.COMPLETED / totalTasks) * 100)
                : 0,
        };
    },

    /**
     * Get all teams with performance summary
     */
    async getTeamComparison(organizationId: string) {
        const teams = await prisma.team.findMany({
            where: { organizationId },
            include: {
                _count: { select: { memberships: true } },
            },
        });

        const teamStats = await Promise.all(
            teams.map(async (team: any) => {
                const [total, completed, inProgress, overdue] = await Promise.all([
                    prisma.task.count({ where: { teamId: team.id } }),
                    prisma.task.count({ where: { teamId: team.id, status: 'COMPLETED' } }),
                    prisma.task.count({ where: { teamId: team.id, status: 'IN_PROGRESS' } }),
                    prisma.task.count({
                        where: {
                            teamId: team.id,
                            status: { not: 'COMPLETED' },
                            dueDate: { lt: new Date() },
                        },
                    }),
                ]);

                return {
                    id: team.id,
                    name: team.name,
                    memberCount: team._count.memberships,
                    stats: {
                        total,
                        completed,
                        inProgress,
                        overdue,
                        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
                    },
                };
            })
        );

        return teamStats.sort((a, b) => b.stats.completionRate - a.stats.completionRate);
    },

    /**
     * Get org-wide completion trends
     */
    async getOrgTrends(organizationId: string, days: number = 14) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        const completions = await prisma.taskHistory.findMany({
            where: {
                task: { organizationId },
                action: 'status_changed',
                newValue: 'COMPLETED',
                createdAt: { gte: startDate },
            },
            select: { createdAt: true },
        });

        const trendData = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const dayCompleted = completions.filter((c: any) => {
                const cDate = new Date(c.createdAt);
                cDate.setHours(0, 0, 0, 0);
                return cDate.getTime() === date.getTime();
            }).length;

            trendData.push({
                date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                completed: dayCompleted,
            });
        }

        return trendData;
    },

    /**
     * Get top performers across org
     */
    async getTopPerformers(organizationId: string, limit: number = 10) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const completions = await prisma.taskHistory.groupBy({
            by: ['userId'],
            where: {
                task: { organizationId },
                action: 'status_changed',
                newValue: 'COMPLETED',
                createdAt: { gte: thirtyDaysAgo },
            },
            _count: true,
            orderBy: { _count: { userId: 'desc' } },
            take: limit,
        });

        const performers = await Promise.all(
            completions.map(async (c: any) => {
                const user = await prisma.user.findUnique({
                    where: { id: c.userId },
                    select: { id: true, name: true, email: true, avatarUrl: true },
                });
                return {
                    user,
                    completedTasks: c._count,
                };
            })
        );

        return performers;
    },

    /**
     * Get priority distribution across org
     */
    async getPriorityDistribution(organizationId: string) {
        const tasks = await prisma.task.findMany({
            where: { organizationId, status: { not: 'COMPLETED' } },
            select: { priority: true },
        });

        return {
            low: tasks.filter((t: any) => t.priority === 'LOW').length,
            medium: tasks.filter((t: any) => t.priority === 'MEDIUM').length,
            high: tasks.filter((t: any) => t.priority === 'HIGH').length,
            urgent: tasks.filter((t: any) => t.priority === 'URGENT').length,
        };
    },
};
