/**
 * Unit tests for Auth Service
 * Tests authentication business logic including registration, login, and profile management
 */

// Mock bcrypt and jwt before imports
jest.mock('bcryptjs', () => ({
    hash: jest.fn().mockResolvedValue('hashed-password'),
    compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
}));

// Mock the user repository
jest.mock('../../repositories/user.repository', () => ({
    userRepository: {
        findByEmail: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
}));

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authService } from '../../services/auth.service';
import { userRepository } from '../../repositories/user.repository';
import { AppError } from '../../lib/errors';

describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        const mockRegisterData = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
        };

        const mockCreatedUser = {
            id: 'user-1',
            email: 'test@example.com',
            name: 'Test User',
            createdAt: new Date(),
        };

        /**
         * Test 1: Successfully register a new user
         */
        it('should successfully register a new user with hashed password', async () => {
            (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
            (userRepository.create as jest.Mock).mockResolvedValue(mockCreatedUser);

            const result = await authService.register(mockRegisterData);

            // Verify password was hashed
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);

            // Verify user was created with hashed password
            expect(userRepository.create).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'hashed-password',
                name: 'Test User',
            });

            // Verify JWT was generated
            expect(jwt.sign).toHaveBeenCalledWith(
                { userId: 'user-1', email: 'test@example.com' },
                expect.any(String),
                expect.objectContaining({ expiresIn: expect.any(String) })
            );

            // Verify response structure
            expect(result).toEqual({
                user: mockCreatedUser,
                token: 'mock-jwt-token',
            });
        });

        /**
         * Test 2: Throw conflict error for duplicate email
         */
        it('should throw conflict error when email already exists', async () => {
            (userRepository.findByEmail as jest.Mock).mockResolvedValue({
                id: 'existing-user',
                email: 'test@example.com',
            });

            await expect(authService.register(mockRegisterData)).rejects.toThrow(AppError);

            // Verify user was not created
            expect(userRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('login', () => {
        const mockLoginData = {
            email: 'test@example.com',
            password: 'password123',
        };

        const mockUser = {
            id: 'user-1',
            email: 'test@example.com',
            name: 'Test User',
            password: 'hashed-password',
            role: 'USER',
            isActive: true,
        };

        /**
         * Test 3: Successfully login with valid credentials
         */
        it('should successfully login with valid credentials', async () => {
            (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await authService.login(mockLoginData);

            // Verify password was compared
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');

            // Verify JWT was generated
            expect(jwt.sign).toHaveBeenCalled();

            // Verify response structure
            expect(result).toEqual({
                user: {
                    id: 'user-1',
                    email: 'test@example.com',
                    name: 'Test User',
                    role: 'USER',
                },
                token: 'mock-jwt-token',
            });
        });

        /**
         * Test 4: Throw unauthorized error for invalid email
         */
        it('should throw unauthorized error for non-existent email', async () => {
            (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

            await expect(authService.login(mockLoginData)).rejects.toThrow(AppError);

            // Verify password was not compared
            expect(bcrypt.compare).not.toHaveBeenCalled();
        });

        /**
         * Test 5: Throw unauthorized error for wrong password
         */
        it('should throw unauthorized error for wrong password', async () => {
            (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(authService.login(mockLoginData)).rejects.toThrow(AppError);
        });
    });

    describe('updateProfile', () => {
        /**
         * Test 6: Throw conflict error when updating to taken email
         */
        it('should throw conflict error when updating email to one already taken', async () => {
            // Another user already has this email
            (userRepository.findByEmail as jest.Mock).mockResolvedValue({
                id: 'other-user',
                email: 'taken@example.com',
            });

            await expect(
                authService.updateProfile('user-1', { email: 'taken@example.com' })
            ).rejects.toThrow(AppError);

            // Verify update was not called
            expect(userRepository.update).not.toHaveBeenCalled();
        });

        it('should allow updating to same email (user owns it)', async () => {
            // User owns this email
            (userRepository.findByEmail as jest.Mock).mockResolvedValue({
                id: 'user-1',
                email: 'same@example.com',
            });
            (userRepository.update as jest.Mock).mockResolvedValue({
                id: 'user-1',
                email: 'same@example.com',
                name: 'Updated Name',
            });

            const result = await authService.updateProfile('user-1', {
                email: 'same@example.com',
                name: 'Updated Name',
            });

            expect(userRepository.update).toHaveBeenCalled();
            expect(result).toBeDefined();
        });
    });
});
