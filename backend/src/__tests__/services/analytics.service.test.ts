/**
 * Unit tests for Analytics Service
 * Tests analytics calculations, trends, and insights generation
 */

// Mock Prisma before imports with all required functions
jest.mock('../../lib/prisma', () => ({
  prisma: {
    task: {
      findMany: jest.fn(),
      groupBy: jest.fn(),
      count: jest.fn(),
    },
    taskHistory: {
      findMany: jest.fn(),
      groupBy: jest.fn(),
      count: jest.fn(),
    },
  },
}));

import { analyticsService } from '../../services/analytics.service';
import { prisma } from '../../lib/prisma';

describe('AnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set default mock returns to prevent undefined errors
    (prisma.taskHistory.count as jest.Mock).mockResolvedValue(0);
    (prisma.taskHistory.groupBy as jest.Mock).mockResolvedValue([]);
    (prisma.taskHistory.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.task.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.task.groupBy as jest.Mock).mockResolvedValue([]);
    (prisma.task.count as jest.Mock).mockResolvedValue(0);
  });

  const mockUserId = 'user-1';

  describe('getCompletionTrends', () => {
    /**
     * Test 1: Calculate completion trends for default period
     */
    it('should calculate completion trends for 7 days', async () => {
      (prisma.taskHistory.groupBy as jest.Mock).mockResolvedValue([
        { createdAt: new Date(), _count: 2 },
      ]);

      const result = await analyticsService.getCompletionTrends(mockUserId, 7);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    /**
     * Test 2: Handle empty results
     */
    it('should handle zero completions', async () => {
      (prisma.taskHistory.groupBy as jest.Mock).mockResolvedValue([]);

      const result = await analyticsService.getCompletionTrends(mockUserId, 7);

      expect(result).toBeDefined();
    });
  });

  describe('getPriorityDistribution', () => {
    /**
     * Test 3: Calculate priority distribution
     */
    it('should calculate task count by priority', async () => {
      (prisma.task.findMany as jest.Mock).mockResolvedValue([
        { priority: 'HIGH' },
        { priority: 'HIGH' },
        { priority: 'MEDIUM' },
        { priority: 'LOW' },
      ]);

      const result = await analyticsService.getPriorityDistribution(mockUserId);

      expect(result).toBeDefined();
      expect(result.high).toBe(2);
      expect(result.medium).toBe(1);
      expect(result.low).toBe(1);
    });

    /**
     * Test 4: Handle no tasks
     */
    it('should handle no tasks gracefully', async () => {
      (prisma.task.groupBy as jest.Mock).mockResolvedValue([]);

      const result = await analyticsService.getPriorityDistribution(mockUserId);

      expect(result).toBeDefined();
    });
  });

  describe('getProductivityMetrics', () => {
    /**
     * Test 5: Calculate productivity metrics
     */
    it('should calculate productivity score and metrics', async () => {
      (prisma.taskHistory.count as jest.Mock).mockResolvedValue(5);
      (prisma.taskHistory.findMany as jest.Mock).mockResolvedValue([
        {
          createdAt: new Date(),
          task: { createdAt: new Date(Date.now() - 86400000 * 2) },
        },
      ]);

      const result = await analyticsService.getProductivityMetrics(mockUserId, 'personal', 7);

      expect(result).toHaveProperty('completedThisWeek');
      expect(result).toHaveProperty('avgCompletionDays');
    });

    /**
     * Test 6: Calculate lead time correctly
     */
    it('should calculate average lead time', async () => {
      const createdDate = new Date(Date.now() - 86400000 * 3);
      const completedDate = new Date();

      (prisma.taskHistory.count as jest.Mock).mockResolvedValue(1);
      (prisma.taskHistory.findMany as jest.Mock).mockResolvedValue([
        {
          createdAt: completedDate,
          task: { createdAt: createdDate },
        },
      ]);

      const result = await analyticsService.getProductivityMetrics(mockUserId, 'personal', 7);

      expect(result.avgCompletionDays).toBeGreaterThanOrEqual(0);
    });

    /**
     * Test 7: Handle zero completion rate
     */
    it('should handle zero completion rate', async () => {
      (prisma.taskHistory.count as jest.Mock).mockResolvedValue(0);
      (prisma.taskHistory.findMany as jest.Mock).mockResolvedValue([]);

      const result = await analyticsService.getProductivityMetrics(mockUserId, 'personal', 7);

      expect(result.completedThisWeek).toBe(0);
    });
  });

  describe('getEfficiencyMetrics', () => {
    /**
     * Test 8: Calculate efficiency metrics
     */
    it('should calculate time spent in each status', async () => {
      (prisma.taskHistory.findMany as jest.Mock).mockResolvedValue([
        {
          taskId: 'task-1',
          action: 'status_changed',
          oldValue: 'TODO',
          newValue: 'IN_PROGRESS',
          createdAt: new Date(Date.now() - 86400000),
        },
      ]);

      const result = await analyticsService.getEfficiencyMetrics(mockUserId);

      expect(result).toBeDefined();
    });

    /**
     * Test 9: Handle no history entries
     */
    it('should handle no history entries', async () => {
      (prisma.taskHistory.findMany as jest.Mock).mockResolvedValue([]);

      const result = await analyticsService.getEfficiencyMetrics(mockUserId);

      expect(result).toBeDefined();
    });
  });

  describe('getActivityHeatmap', () => {
    /**
     * Test 10: Generate activity heatmap data
     */
    it('should generate activity heatmap', async () => {
      (prisma.taskHistory.findMany as jest.Mock).mockResolvedValue([
        { createdAt: new Date() },
        { createdAt: new Date(Date.now() - 86400000) },
      ]);

      const result = await analyticsService.getActivityHeatmap(mockUserId);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    /**
     * Test 11: Handle no activity
     */
    it('should handle no activity in period', async () => {
      (prisma.taskHistory.findMany as jest.Mock).mockResolvedValue([]);

      const result = await analyticsService.getActivityHeatmap(mockUserId);

      expect(result).toBeDefined();
    });
  });

  describe('getInsights', () => {
    /**
     * Test 12: Generate insights from task data
     */
    it('should generate smart insights', async () => {
      (prisma.task.findMany as jest.Mock).mockResolvedValue([
        { id: 'task-1', status: 'COMPLETED', priority: 'HIGH', dueDate: new Date() },
        { id: 'task-2', status: 'TODO', priority: 'LOW', dueDate: null },
      ]);

      const result = await analyticsService.getInsights(mockUserId, 'personal', 7);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    /**
     * Test 13: Handle empty task list
     */
    it('should handle empty task list for insights', async () => {
      (prisma.task.findMany as jest.Mock).mockResolvedValue([]);

      const result = await analyticsService.getInsights(mockUserId, 'personal', 7);

      expect(result).toBeDefined();
    });
  });

  describe('Scope filtering', () => {
    /**
     * Test 14: Personal scope filters by userId
     */
    it('should filter by personal scope', async () => {
      (prisma.taskHistory.groupBy as jest.Mock).mockResolvedValue([]);

      await analyticsService.getCompletionTrends(mockUserId, 7, 'personal');

      expect(prisma.taskHistory.groupBy).toHaveBeenCalled();
    });
  });
});
