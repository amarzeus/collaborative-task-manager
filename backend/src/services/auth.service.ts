/**
 * Authentication Service
 * Handles user registration, login, and profile management
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { userRepository } from '../repositories/user.repository.js';
import { AppError } from '../lib/errors.js';
import type { RegisterDto, LoginDto, UpdateProfileDto } from '../dtos/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Check if an email matches any configured admin email patterns
 * Supports exact match, wildcard prefix (*@domain.com), or wildcard domain (user@*)
 */
function isAdminEmail(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS || '';
  if (!adminEmails) return false;

  const patterns = adminEmails.split(',').map((p) => p.trim().toLowerCase());
  const emailLower = email.toLowerCase();

  return patterns.some((pattern) => {
    if (!pattern) return false;

    // Exact match
    if (pattern === emailLower) return true;

    // Wildcard patterns
    if (pattern.includes('*')) {
      // *@domain.com - matches any user at that domain
      if (pattern.startsWith('*@')) {
        const domain = pattern.slice(2);
        return emailLower.endsWith('@' + domain);
      }
      // user@* - matches that user at any domain
      if (pattern.endsWith('@*')) {
        const user = pattern.slice(0, -2);
        return emailLower.startsWith(user + '@');
      }
    }

    return false;
  });
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
  };
  token: string;
}

export const authService = {
  /**
   * Register a new user
   * Auto-assigns ADMIN role if email matches configured admin patterns
   * @throws AppError if email already exists
   */
  async register(data: RegisterDto): Promise<AuthResponse> {
    // Check if email already exists
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw AppError.conflict('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Determine role based on email pattern
    const role = isAdminEmail(data.email) ? 'ADMIN' : 'USER';

    // Create user with auto-assigned role
    const user = await userRepository.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role,
    });

    // Generate JWT with role in payload
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    } as jwt.SignOptions);

    return { user, token };
  },

  /**
   * Login user with email and password
   * @throws AppError if credentials are invalid
   */
  async login(data: LoginDto): Promise<AuthResponse> {
    // Find user by email
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw AppError.forbidden('Account is suspended');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw AppError.unauthorized('Invalid email or password');
    }

    // Update lastLoginAt
    await userRepository.update(user.id, { lastLoginAt: new Date() });

    // Generate JWT with role in payload
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    } as jwt.SignOptions);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    };
  },

  /**
   * Get current user profile (excludes password)
   */
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }
    // Exclude password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: UpdateProfileDto) {
    // If updating email, check if it's already taken
    if (data.email) {
      const existing = await userRepository.findByEmail(data.email);
      if (existing && existing.id !== userId) {
        throw AppError.conflict('Email already taken');
      }
    }

    return userRepository.update(userId, data);
  },

  /**
   * Change user password
   * @throws AppError if current password is invalid
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    // Get user with password
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw AppError.unauthorized('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await userRepository.update(userId, { password: hashedPassword });

    return { success: true };
  },

  /**
   * Delete user account
   */
  async deleteAccount(userId: string, password: string) {
    // Get user
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    // Verify password before deletion
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw AppError.unauthorized('Password is incorrect');
    }

    // Delete user (cascade will handle related data)
    await userRepository.delete(userId);

    return { success: true };
  },
};
