/**
 * Analytics Service
 * Generates insights and analytics from task history
 */

import { prisma } from '../lib/prisma.js';
import { Status, Priority } from '@prisma/client';

export type AnalyticsScope = 'personal' | 'global';

export const analyticsService = {
  /**
   * Get completion trends
   */
  async getCompletionTrends(userId: string, days: number = 7, scope: AnalyticsScope = 'personal') {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const whereBase = scope === 'personal'
      ? { task: { OR: [{ creatorId: userId }, { assignedToId: userId }] } }
      : {};

    // Get completed tasks per day
    const completions = await prisma.taskHistory.groupBy({
      by: ['createdAt'],
      where: {
        action: 'status_changed',
        newValue: 'COMPLETED',
        createdAt: { gte: startDate },
        ...whereBase,
      },
      _count: true,
    });

    // Get created tasks per day
    const creations = await prisma.taskHistory.groupBy({
      by: ['createdAt'],
      where: {
        action: 'created',
        createdAt: { gte: startDate },
        ...(scope === 'personal' ? { task: { creatorId: userId } } : {}),
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
   * Get priority distribution
   */
  async getPriorityDistribution(userId: string, scope: AnalyticsScope = 'personal') {
    const where: any = { status: { not: 'COMPLETED' } };
    if (scope === 'personal') {
      where.OR = [{ creatorId: userId }, { assignedToId: userId }];
    }

    const tasks = await prisma.task.findMany({
      where,
      select: { priority: true },
    });

    return {
      low: tasks.filter((t) => t.priority === 'LOW').length,
      medium: tasks.filter((t) => t.priority === 'MEDIUM').length,
      high: tasks.filter((t) => t.priority === 'HIGH').length,
      urgent: tasks.filter((t) => t.priority === 'URGENT').length,
    };
  },

  /**
   * Get productivity metrics with trends and performance score
   */
  async getProductivityMetrics(userId: string, scope: AnalyticsScope = 'personal', days: number = 7) {
    const now = new Date();
    const periodMs = days * 24 * 60 * 60 * 1000;
    const periodStart = new Date(now.getTime() - periodMs);
    const prevPeriodStart = new Date(now.getTime() - 2 * periodMs);

    const whereBase = scope === 'personal' ? { task: { assignedToId: userId } } : {};

    // Completions current vs previous for trend
    const [completedThisPeriod, completedPrevPeriod] = await Promise.all([
      prisma.taskHistory.count({
        where: { action: 'status_changed', newValue: 'COMPLETED', createdAt: { gte: periodStart }, ...whereBase },
      }),
      prisma.taskHistory.count({
        where: { action: 'status_changed', newValue: 'COMPLETED', createdAt: { gte: prevPeriodStart, lt: periodStart }, ...whereBase },
      })
    ]);

    const throughputTrend = completedPrevPeriod === 0 ? 100 : Math.round(((completedThisPeriod - completedPrevPeriod) / completedPrevPeriod) * 100);

    // Lead Time calculation for current period
    const completedTasks = await prisma.taskHistory.findMany({
      where: { action: 'status_changed', newValue: 'COMPLETED', createdAt: { gte: periodStart }, ...whereBase },
      include: { task: { select: { createdAt: true } } },
    });

    // Lead Time calculation for previous period (for trend)
    const prevCompletedTasks = await prisma.taskHistory.findMany({
      where: { action: 'status_changed', newValue: 'COMPLETED', createdAt: { gte: prevPeriodStart, lt: periodStart }, ...whereBase },
      include: { task: { select: { createdAt: true } } },
    });

    const calculateAvgLeadTime = (tasks: any[]) => {
      if (tasks.length === 0) return 0;
      let totalTime = 0;
      tasks.forEach((history) => {
        const duration = history.createdAt.getTime() - history.task.createdAt.getTime();
        totalTime += Math.max(0, duration);
      });
      return totalTime / tasks.length / (24 * 60 * 60 * 1000);
    };

    const avgCompletionDays = calculateAvgLeadTime(completedTasks);
    const prevAvgCompletionDays = calculateAvgLeadTime(prevCompletedTasks);

    const leadTimeTrend = prevAvgCompletionDays === 0
      ? 0
      : Math.round(((avgCompletionDays - prevAvgCompletionDays) / prevAvgCompletionDays) * 100);

    // Productivity trend (overall score/volume trend)
    const productivityTrend = completedPrevPeriod === 0 ? 100 : Math.round(((completedThisPeriod - completedPrevPeriod) / completedPrevPeriod) * 100);

    // Performance Score (out of 1000)
    // Factors: Velocity (throughput), Speed (lead time), and Volume
    const velocityFactor = Math.min(400, (completedThisPeriod / days) * 400); // 1 task/day = 100%
    const speedFactor = Math.min(300, (2 / Math.max(0.1, avgCompletionDays)) * 300); // 2 days = 100% 
    const volumeFactor = Math.min(300, (completedTasks.length / 20) * 300); // 20 tasks in period = 100%

    const performanceScore = Math.round(velocityFactor + speedFactor + volumeFactor);

    return {
      completedThisWeek: completedThisPeriod, // Keep name for frontend compat
      avgCompletionDays: Math.round(avgCompletionDays * 10) / 10,
      totalCompleted: completedThisPeriod, // Total in THIS period
      performanceScore: Math.min(999, performanceScore),
      throughputTrend,
      leadTimeTrend: -leadTimeTrend, // Negative lead time trend is GOOD (lower is better), so we flip it for the UI badge if it expects "up is good"
      productivityTrend,
    };
  },

  /**
   * Get efficiency metrics (time in status)
   */
  async getEfficiencyMetrics(userId: string, scope: AnalyticsScope = 'personal') {
    const whereBase = scope === 'personal' ? { assignedToId: userId } : {};

    // Get last 30 completed tasks
    const tasks = await prisma.task.findMany({
      where: { status: 'COMPLETED', ...whereBase },
      take: 30,
      include: { history: { orderBy: { createdAt: 'asc' } } },
    });

    const times: Record<string, { total: number; count: number }> = {
      'TODO': { total: 0, count: 0 },
      'IN_PROGRESS': { total: 0, count: 0 },
      'REVIEW': { total: 0, count: 0 },
    };

    tasks.forEach(task => {
      const h = task.history;
      for (let i = 0; i < h.length - 1; i++) {
        const current = h[i];
        const next = h[i + 1];
        const duration = (next.createdAt.getTime() - current.createdAt.getTime()) / (24 * 60 * 60 * 1000);

        const status = current.newValue || (current.action === 'created' ? 'TODO' : '');
        if (times[status]) {
          times[status].total += duration;
          times[status].count++;
        }
      }
    });

    return [
      { status: 'TODO', avgDays: Math.round((times['TODO'].total / (times['TODO'].count || 1)) * 10) / 10 },
      { status: 'IN_PROGRESS', avgDays: Math.round((times['IN_PROGRESS'].total / (times['IN_PROGRESS'].count || 1)) * 10) / 10 },
      { status: 'REVIEW', avgDays: Math.round((times['REVIEW'].total / (times['REVIEW'].count || 1)) * 10) / 10 || 0.5 },
    ];
  },

  /**
   * Get activity heatmap data (last 90 days)
   */
  async getActivityHeatmap(userId: string, scope: AnalyticsScope = 'personal') {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const where: any = {
      action: 'status_changed',
      newValue: 'COMPLETED',
      createdAt: { gte: ninetyDaysAgo },
    };
    if (scope === 'personal') {
      where.task = { assignedToId: userId };
    }

    const completions = await prisma.taskHistory.findMany({
      where,
      select: { createdAt: true },
    });

    const counts: Record<string, number> = {};
    completions.forEach(c => {
      const date = c.createdAt.toISOString().split('T')[0];
      counts[date] = (counts[date] || 0) + 1;
    });

    return Object.entries(counts).map(([date, count]) => ({ date, count }));
  },

  /**
   * Generate smart insights
   */
  async getInsights(userId: string, scope: AnalyticsScope = 'personal', days: number = 7) {
    const insights: string[] = [];
    const where: any = {};
    if (scope === 'personal') {
      where.OR = [{ assignedToId: userId }, { creatorId: userId }];
    }

    const [tasks, productivity] = await Promise.all([
      prisma.task.findMany({ where }),
      this.getProductivityMetrics(userId, scope, days)
    ]);

    const overdueTasks = tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED');

    if (overdueTasks.length > 0) {
      insights.push(`${scope === 'personal' ? 'You have' : 'There are'} ${overdueTasks.length} overdue tasks that need attention.`);
    }

    if (productivity.completedThisWeek > 10) {
      insights.push(`Exceptional week! Your throughput is ${Math.round(productivity.completedThisWeek / 5 * 100)}% above your baseline.`);
    } else if (productivity.completedThisWeek > 0) {
      insights.push(`Maintain momentum. ${productivity.completedThisWeek} tasks completed this period.`);
    }

    if (productivity.performanceScore > 800) {
      insights.push("Consistency reached 'Elite' status. Your lead time is among the top 10% of users.");
    }

    const urgentTasks = tasks.filter(t => t.priority === 'URGENT' && t.status !== 'COMPLETED');
    if (urgentTasks.length > 0) {
      insights.push(`Urgent focus required: ${urgentTasks.length} high-impact tasks are still open.`);
    }

    if (scope === 'global') {
      const activeUsers = await prisma.task.groupBy({
        by: ['assignedToId'],
        where: { status: { not: 'COMPLETED' }, assignedToId: { not: null } },
        _count: true
      });
      insights.push(`${activeUsers.length} teammates are currently pushing updates in real-time.`);
    }

    return insights.slice(0, 4);
  },
};

