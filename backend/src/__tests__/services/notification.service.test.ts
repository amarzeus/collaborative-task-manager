/**
 * Unit tests for Notification Service
 * Tests notification management operations
 */

// Mock the notification repository
jest.mock('../../repositories/notification.repository', () => ({
  notificationRepository: {
    findByUserId: jest.fn(),
    countUnread: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
  },
}));

import { notificationService } from '../../services/notification.service';
import { notificationRepository } from '../../repositories/notification.repository';

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserNotifications', () => {
    /**
     * Test 1: Return notifications with unread count
     */
    it('should return notifications with unread count', async () => {
      const mockNotifications = [
        { id: 'notif-1', title: 'Task Assigned', read: false },
        { id: 'notif-2', title: 'Task Updated', read: true },
      ];
      (notificationRepository.findByUserId as jest.Mock).mockResolvedValue(mockNotifications);
      (notificationRepository.countUnread as jest.Mock).mockResolvedValue(1);

      const result = await notificationService.getUserNotifications('user-1');

      expect(notificationRepository.findByUserId).toHaveBeenCalledWith('user-1');
      expect(notificationRepository.countUnread).toHaveBeenCalledWith('user-1');
      expect(result.notifications).toEqual(mockNotifications);
      expect(result.unreadCount).toBe(1);
    });

    /**
     * Test 2: Return empty list when no notifications
     */
    it('should return empty list when no notifications', async () => {
      (notificationRepository.findByUserId as jest.Mock).mockResolvedValue([]);
      (notificationRepository.countUnread as jest.Mock).mockResolvedValue(0);

      const result = await notificationService.getUserNotifications('user-1');

      expect(result.notifications).toEqual([]);
      expect(result.unreadCount).toBe(0);
    });
  });

  describe('markAsRead', () => {
    /**
     * Test 3: Mark single notification as read
     */
    it('should mark single notification as read', async () => {
      const mockUpdatedNotification = {
        id: 'notif-1',
        title: 'Task Assigned',
        read: true,
      };
      (notificationRepository.markAsRead as jest.Mock).mockResolvedValue(mockUpdatedNotification);

      const result = await notificationService.markAsRead('notif-1');

      expect(notificationRepository.markAsRead).toHaveBeenCalledWith('notif-1');
      expect(result).toEqual(mockUpdatedNotification);
    });
  });

  describe('markAllAsRead', () => {
    /**
     * Test 4: Mark all notifications as read for user
     */
    it('should mark all notifications as read for user', async () => {
      (notificationRepository.markAllAsRead as jest.Mock).mockResolvedValue({ count: 5 });

      const result = await notificationService.markAllAsRead('user-1');

      expect(notificationRepository.markAllAsRead).toHaveBeenCalledWith('user-1');
      expect(result).toEqual({ count: 5 });
    });

    /**
     * Test 5: Handle case with no unread notifications
     */
    it('should handle case with no unread notifications', async () => {
      (notificationRepository.markAllAsRead as jest.Mock).mockResolvedValue({ count: 0 });

      const result = await notificationService.markAllAsRead('user-1');

      expect(result).toEqual({ count: 0 });
    });
  });
});
