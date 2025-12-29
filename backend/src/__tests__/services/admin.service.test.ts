/**
 * Unit tests for Admin Service
 * Tests admin user management operations
 */

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

// Mock Prisma
jest.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    task: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  },
}));

import bcrypt from 'bcryptjs';
import { adminService } from '../../services/admin.service';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../lib/errors';

describe('AdminService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const mockCreateData = {
      email: 'newuser@example.com',
      name: 'New User',
      password: 'Password123',
      role: 'USER' as const,
    };

    /**
     * Test 1: Successfully create a new user with hashed password
     */
    it('should create a new user with hashed password', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'newuser@example.com',
        name: 'New User',
        role: 'USER',
        isActive: true,
        createdAt: new Date(),
      });

      const result = await adminService.createUser(mockCreateData, 'admin-1');

      expect(bcrypt.hash).toHaveBeenCalledWith('Password123', 12);
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'newuser@example.com',
            password: 'hashed-password',
          }),
        })
      );
      expect(result.email).toBe('newuser@example.com');
    });

    /**
     * Test 2: Throw conflict error for duplicate email
     */
    it('should throw conflict error for duplicate email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-user',
        email: 'newuser@example.com',
      });

      await expect(adminService.createUser(mockCreateData, 'admin-1')).rejects.toThrow(AppError);

      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    /**
     * Test 3: Return user when found
     */
    it('should return user when found', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        isActive: true,
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await adminService.getUserById('user-1');

      expect(result).toEqual(mockUser);
    });

    /**
     * Test 4: Throw not found error for non-existent user
     */
    it('should throw not found error for non-existent user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(adminService.getUserById('non-existent')).rejects.toThrow(AppError);
    });
  });

  describe('updateUser', () => {
    const mockExistingUser = {
      id: 'user-1',
      email: 'original@example.com',
      name: 'Original Name',
      role: 'USER',
    };

    /**
     * Test 5: Prevent admin from modifying their own role
     */
    it('should prevent admin from modifying their own role', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockExistingUser,
        id: 'admin-1',
        role: 'ADMIN',
      });

      await expect(adminService.updateUser('admin-1', { role: 'USER' }, 'admin-1')).rejects.toThrow(
        AppError
      );

      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    /**
     * Test 6: Throw conflict error when updating to taken email
     */
    it('should throw conflict error when updating to taken email', async () => {
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockExistingUser) // First call: check user exists
        .mockResolvedValueOnce({ id: 'other-user', email: 'taken@example.com' }); // Second call: email taken

      await expect(
        adminService.updateUser('user-1', { email: 'taken@example.com' }, 'admin-1')
      ).rejects.toThrow(AppError);

      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('suspendUser', () => {
    /**
     * Test 7: Prevent admin from suspending themselves
     */
    it('should prevent admin from suspending themselves', async () => {
      await expect(adminService.suspendUser('admin-1', 'admin-1')).rejects.toThrow(AppError);
    });

    /**
     * Test 8: Successfully suspend an active user
     */
    it('should successfully suspend an active user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        name: 'Test User',
        role: 'USER',
        isActive: true,
      });
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      const result = await adminService.suspendUser('user-1', 'admin-1');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { isActive: false },
      });
      expect(result.success).toBe(true);
    });

    /**
     * Test 9: Throw error when user is already suspended
     */
    it('should throw error when user is already suspended', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        isActive: false,
      });

      await expect(adminService.suspendUser('user-1', 'admin-1')).rejects.toThrow(AppError);
    });

    /**
     * Test 10: Prevent suspending SUPER_ADMIN
     */
    it('should prevent suspending SUPER_ADMIN', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'superadmin-1',
        role: 'SUPER_ADMIN',
        isActive: true,
      });

      await expect(adminService.suspendUser('superadmin-1', 'admin-1')).rejects.toThrow(AppError);
    });
  });

  describe('activateUser', () => {
    /**
     * Test 11: Successfully activate a suspended user
     */
    it('should successfully activate a suspended user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        isActive: false,
      });
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      const result = await adminService.activateUser('user-1');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { isActive: true },
      });
      expect(result.success).toBe(true);
    });

    /**
     * Test 12: Throw error when user is already active
     */
    it('should throw error when user is already active', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        isActive: true,
      });

      await expect(adminService.activateUser('user-1')).rejects.toThrow(AppError);
    });
  });
});
