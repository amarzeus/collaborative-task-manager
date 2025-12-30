/**
 * Team Dashboard Service
 * Provides team-scoped analytics for Team Leaders
 */

import { prisma } from '../lib/prisma.js';
import { TeamRole } from '@prisma/client';

export const teamDashboardService = {
    /**
     * Get team overview stats
     */
    async getTeamOverview(teamId: string) {
        const [team, memberCount, taskStats] = await Promise.all([
            prisma.team.findUnique({
                where: { id: teamId },
                include: { organization: { select: { name: true } } },
            }),
            prisma.teamMembership.count({ where: { teamId } }),
            prisma.task.groupBy({
                by: ['status'],
                where: { teamId },
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
            team,
            memberCount,
            taskStats: statusCounts,
            totalTasks,
            completionRate: totalTasks > 0
                ? Math.round((statusCounts.COMPLETED / totalTasks) * 100)
                : 0,
        };
    },

    /**
     * Get team member performance
     */
    async getMemberPerformance(teamId: string) {
        const members = await prisma.teamMembership.findMany({
            where: { teamId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
            },
        });

        const memberStats = await Promise.all(
            members.map(async (m: any) => {
                const [assigned, completed, inProgress] = await Promise.all([
                    prisma.task.count({
                        where: { teamId, assignedToId: m.userId },
                    }),
                    prisma.task.count({
                        where: { teamId, assignedToId: m.userId, status: 'COMPLETED' },
                    }),
                    prisma.task.count({
                        where: { teamId, assignedToId: m.userId, status: 'IN_PROGRESS' },
                    }),
                ]);

                return {
                    user: m.user,
                    role: m.role,
                    stats: {
                        assigned,
                        completed,
                        inProgress,
                        completionRate: assigned > 0 ? Math.round((completed / assigned) * 100) : 0,
                    },
                };
            })
        );

        return memberStats;
    },

    /**
     * Get team tasks by status
     */
    async getTeamTasks(teamId: string, status?: string) {
        const where: any = { teamId };
        if (status) {
            where.status = status;
        }

        return prisma.task.findMany({
            where,
            include: {
                creator: { select: { id: true, name: true, email: true } },
                assignedTo: { select: { id: true, name: true, email: true } },
            },
            orderBy: [
                { priority: 'desc' },
                { dueDate: 'asc' },
            ],
        });
    },

    /**
     * Get team completion trends (last 7 days)
     */
    async getTeamTrends(teamId: string, days: number = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        const completions = await prisma.taskHistory.findMany({
            where: {
                task: { teamId },
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
                date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                completed: dayCompleted,
            });
        }

        return trendData;
    },

    /**
     * Get unassigned team tasks (for drag-to-assign)
     */
    async getUnassignedTasks(teamId: string) {
        return prisma.task.findMany({
            where: {
                teamId,
                assignedToId: null,
                status: { not: 'COMPLETED' },
            },
            orderBy: [
                { priority: 'desc' },
                { dueDate: 'asc' },
            ],
        });
    },

    /**
     * Assign task to team member (Team Leader only)
     */
    async assignTask(taskId: string, assigneeId: string, assignerId: string) {
        return prisma.task.update({
            where: { id: taskId },
            data: { assignedToId: assigneeId },
            include: {
                assignedTo: { select: { id: true, name: true, email: true } },
            },
        });
    },
};
