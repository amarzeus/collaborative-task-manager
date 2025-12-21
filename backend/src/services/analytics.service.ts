/**
 * Analytics Service
 * Generates insights and analytics from task history
 */

import { prisma } from '../lib/prisma.js';
import { Status, Priority } from '@prisma/client';

export const analyticsService = {
  /**
   * Get task completion trends for the last N days
   */
  async getCompletionTrends(userId: string, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get completed tasks per day
    const completions = await prisma.taskHistory.groupBy({
      by: ['createdAt'],
      where: {
        action: 'status_changed',
        newValue: 'COMPLETED',
        createdAt: {
          gte: startDate,
        },
        task: {
          OR: [{ creatorId: userId }, { assignedToId: userId }],
        },
      },
      _count: true,
    });

    // Get created tasks per day
    const creations = await prisma.taskHistory.groupBy({
      by: ['createdAt'],
      where: {
        action: 'created',
        createdAt: {
          gte: startDate,
        },
        task: {
          creatorId: userId,
        },
      },
      _count: true,
    });

    // Format data by day
    const trendData = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dayCompleted = completions
        .filter((c) => {
          const cDate = new Date(c.createdAt);
          cDate.setHours(0, 0, 0, 0);
          return cDate.getTime() === date.getTime();
        })
        .reduce((sum, c) => sum + c._count, 0);

      const dayCreated = creations
        .filter((c) => {
          const cDate = new Date(c.createdAt);
          cDate.setHours(0, 0, 0, 0);
          return cDate.getTime() === date.getTime();
        })
        .reduce((sum, c) => sum + c._count, 0);

      trendData.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: dayCompleted,
        created: dayCreated,
      });
    }

    return trendData;
  },

  /**
   * Get priority distribution of active tasks
   */
  async getPriorityDistribution(userId: string) {
    const tasks = await prisma.task.findMany({
      where: {
        OR: [{ creatorId: userId }, { assignedToId: userId }],
        status: {
          not: 'COMPLETED',
        },
      },
      select: {
        priority: true,
      },
    });

    return {
      low: tasks.filter((t) => t.priority === 'LOW').length,
      medium: tasks.filter((t) => t.priority === 'MEDIUM').length,
      high: tasks.filter((t) => t.priority === 'HIGH').length,
      urgent: tasks.filter((t) => t.priority === 'URGENT').length,
    };
  },

  /**
   * Get productivity metrics
   */
  async getProductivityMetrics(userId: string) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Tasks completed this week
    const completedThisWeek = await prisma.taskHistory.count({
      where: {
        action: 'status_changed',
        newValue: 'COMPLETED',
        createdAt: {
          gte: weekAgo,
        },
        task: {
          assignedToId: userId,
        },
      },
    });

    // Average completion time (time from creation to completion)
    const completedTasks = await prisma.taskHistory.findMany({
      where: {
        action: 'status_changed',
        newValue: 'COMPLETED',
        task: {
          assignedToId: userId,
        },
      },
      include: {
        task: {
          select: {
            createdAt: true,
          },
        },
      },
      take: 50,
      orderBy: {
        createdAt: 'desc',
      },
    });

    let totalTime = 0;
    completedTasks.forEach((history) => {
      const completedAt = history.createdAt.getTime();
      const createdAt = history.task.createdAt.getTime();
      totalTime += completedAt - createdAt;
    });

    const avgCompletionDays =
      completedTasks.length > 0 ? totalTime / completedTasks.length / (24 * 60 * 60 * 1000) : 0;

    return {
      completedThisWeek,
      avgCompletionDays: Math.round(avgCompletionDays * 10) / 10,
      totalCompleted: completedTasks.length,
    };
  },

  /**
   * Generate smart insights based on user data
   */
  async getInsights(userId: string) {
    const insights: string[] = [];

    // Get all user tasks
    const tasks = await prisma.task.findMany({
      where: {
        OR: [{ assignedToId: userId }, { creatorId: userId }],
      },
    });

    const assignedTasks = tasks.filter((t) => t.assignedToId === userId);
    const overdueTasks = assignedTasks.filter(
      (t) => new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED'
    );
    const highPriorityPending = assignedTasks.filter(
      (t) => (t.priority === 'HIGH' || t.priority === 'URGENT') && t.status !== 'COMPLETED'
    );
    const inProgressTasks = assignedTasks.filter((t) => t.status === 'IN_PROGRESS');

    // Generate insights
    if (overdueTasks.length > 0) {
      insights.push(
        `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}. Consider prioritizing them.`
      );
    }

    if (highPriorityPending.length > 3) {
      insights.push(`You have ${highPriorityPending.length} high-priority tasks pending.`);
    }

    if (inProgressTasks.length > 5) {
      insights.push(
        `You have ${inProgressTasks.length} tasks in progress. Focus on completing some before starting new ones.`
      );
    }

    if (assignedTasks.length === 0) {
      insights.push('Great! You have no tasks assigned. Consider picking up new work.');
    } else if (overdueTasks.length === 0 && assignedTasks.length > 0) {
      insights.push('Excellent! You have no overdue tasks. Keep up the good work!');
    }

    // Productivity trends
    const productivity = await this.getProductivityMetrics(userId);
    if (productivity.completedThisWeek > 10) {
      insights.push(
        `Impressive! You've completed ${productivity.completedThisWeek} tasks this week.`
      );
    } else if (productivity.completedThisWeek === 0) {
      insights.push('No tasks completed this week. Time to get started!');
    }

    return insights.slice(0, 3); // Return top 3 insights
  },
};
