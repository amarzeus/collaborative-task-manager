/**
 * Upload Routes
 * Handles file uploads (avatars)
 */

import { Router, Request, Response } from 'express';
import { uploadAvatar, deleteAvatarFile } from '../middleware/upload.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { userRepository } from '../repositories/user.repository.js';

const router = Router();

/**
 * POST /api/v1/upload/avatar
 * Upload user avatar
 */
router.post('/avatar', authenticate, uploadAvatar.single('avatar'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const userId = (req as any).user!.id;
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Get current user to check for old avatar
    const currentUser = await userRepository.findById(userId);

    // Delete old avatar if exists
    if (currentUser?.avatarUrl) {
      deleteAvatarFile(currentUser.avatarUrl);
    }

    // Update user with new avatar URL
    const updatedUser = await userRepository.updateAvatar(userId, avatarUrl);

    res.json({
      success: true,
      data: {
        avatarUrl: updatedUser.avatarUrl,
        user: updatedUser,
      },
    });
  } catch (error: any) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload avatar',
    });
  }
});

/**
 * DELETE /api/v1/upload/avatar
 * Delete user avatar
 */
router.delete('/avatar', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user!.id;

    // Get current user
    const currentUser = await userRepository.findById(userId);

    if (!currentUser?.avatarUrl) {
      return res.status(404).json({
        success: false,
        message: 'No avatar to delete',
      });
    }

    // Delete file
    deleteAvatarFile(currentUser.avatarUrl);

    // Update user to remove avatar URL
    const updatedUser = await userRepository.updateAvatar(userId, '');

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error: any) {
    console.error('Avatar delete error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete avatar',
    });
  }
});

export default router;
