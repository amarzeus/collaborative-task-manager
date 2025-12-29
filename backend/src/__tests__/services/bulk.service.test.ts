/**
 * Unit tests for Bulk Service
 * Tests bulk task operations
 */

// Mock Prisma
jest.mock('../../lib/prisma', () => ({
  prisma: {
    task: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock audit service
jest.mock('../../services/audit.service', () => ({
  auditService: {
    log: jest.fn().mockResolvedValue({}),
  },
}));

import { bulkService } from '../../services/bulk.service';
import { prisma } from '../../lib/prisma';
import { auditService } from '../../services/audit.service';
import { AppError } from '../../lib/errors';

describe('BulkService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('bulkTaskOperation', () => {
    const mockActor = { id: 'admin-1', email: 'admin@example.com' };
    const mockTaskIds = ['task-1', 'task-2', 'task-3'];

    /**
     * Test 1: Successfully assign tasks in bulk
     */
    it('should successfully assign tasks in bulk', async () => {
      (prisma.task.findMany as jest.Mock).mockResolvedValue([
        { id: 'task-1', status: 'TODO' },
        { id: 'task-2', status: 'IN_PROGRESS' },
        { id: 'task-3', status: 'TODO' },
      ]);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        name: 'Assignee',
        isActive: true,
      });
      (prisma.task.updateMany as jest.Mock).mockResolvedValue({ count: 3 });

      const result = await bulkService.bulkTaskOperation(
        { action: 'assign', taskIds: mockTaskIds, data: { assigneeId: 'user-1' } },
        mockActor
      );

      expect(result.success).toBe(true);
      expect(result.processed).toBe(3);
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'BULK_ASSIGN' })
      );
    });

    /**
     * Test 2: Throw error when assignee ID missing for assign action
     */
    it('should throw error when assignee ID missing for assign action', async () => {
      await expect(
        bulkService.bulkTaskOperation({ action: 'assign', taskIds: mockTaskIds }, mockActor)
      ).rejects.toThrow(AppError);
    });

    /**
     * Test 3: Throw error when assignee not found
     */
    it('should throw error when assignee not found', async () => {
      (prisma.task.findMany as jest.Mock).mockResolvedValue([{ id: 'task-1' }]);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        bulkService.bulkTaskOperation(
          { action: 'assign', taskIds: mockTaskIds, data: { assigneeId: 'non-existent' } },
          mockActor
        )
      ).rejects.toThrow(AppError);
    });

    /**
     * Test 4: Throw error when assigning to suspended user
     */
    it('should throw error when assigning to suspended user', async () => {
      (prisma.task.findMany as jest.Mock).mockResolvedValue([{ id: 'task-1' }]);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        name: 'Suspended User',
        isActive: false,
      });

      await expect(
        bulkService.bulkTaskOperation(
          { action: 'assign', taskIds: mockTaskIds, data: { assigneeId: 'user-1' } },
          mockActor
        )
      ).rejects.toThrow(AppError);
    });

    /**
     * Test 5: Successfully update status in bulk
     */
    it('should successfully update status in bulk', async () => {
      (prisma.task.findMany as jest.Mock).mockResolvedValue([{ id: 'task-1' }, { id: 'task-2' }]);
      (prisma.task.updateMany as jest.Mock).mockResolvedValue({ count: 2 });

      const result = await bulkService.bulkTaskOperation(
        { action: 'update_status', taskIds: ['task-1', 'task-2'], data: { status: 'COMPLETED' } },
        mockActor
      );

      expect(result.success).toBe(true);
      expect(result.processed).toBe(2);
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'BULK_STATUS_UPDATE' })
      );
    });

    /**
     * Test 6: Throw error when status missing for update_status action
     */
    it('should throw error when status missing for update_status action', async () => {
      await expect(
        bulkService.bulkTaskOperation({ action: 'update_status', taskIds: mockTaskIds }, mockActor)
      ).rejects.toThrow(AppError);
    });

    /**
     * Test 7: Successfully delete tasks in bulk
     */
    it('should successfully delete tasks in bulk', async () => {
      (prisma.task.findMany as jest.Mock).mockResolvedValue([{ id: 'task-1' }, { id: 'task-2' }]);
      (prisma.task.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });

      const result = await bulkService.bulkTaskOperation(
        { action: 'delete', taskIds: ['task-1', 'task-2'] },
        mockActor
      );

      expect(result.success).toBe(true);
      expect(result.processed).toBe(2);
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'BULK_DELETE' })
      );
    });

    /**
     * Test 8: Track missing tasks as errors
     */
    it('should track missing tasks as errors', async () => {
      (prisma.task.findMany as jest.Mock).mockResolvedValue([
        { id: 'task-1' }, // Only task-1 exists
      ]);
      (prisma.task.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await bulkService.bulkTaskOperation(
        {
          action: 'update_status',
          taskIds: ['task-1', 'task-2', 'task-3'],
          data: { status: 'COMPLETED' },
        },
        mockActor
      );

      expect(result.processed).toBe(1);
      expect(result.failed).toBe(2); // task-2 and task-3 not found
      expect(result.errors).toHaveLength(2);
    });

    /**
     * Test 9: Throw error for unknown action
     */
    it('should throw error for unknown action', async () => {
      (prisma.task.findMany as jest.Mock).mockResolvedValue([{ id: 'task-1' }]);

      await expect(
        bulkService.bulkTaskOperation(
          { action: 'unknown_action' as any, taskIds: mockTaskIds },
          mockActor
        )
      ).rejects.toThrow(AppError);
    });
  });
});
