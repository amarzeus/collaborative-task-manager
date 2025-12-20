"use strict";
/**
 * Unit tests for Auth Service
 * Tests authentication business logic including registration, login, and profile management
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_service_1 = require("../../services/auth.service");
const user_repository_1 = require("../../repositories/user.repository");
const errors_1 = require("../../lib/errors");
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
            user_repository_1.userRepository.findByEmail.mockResolvedValue(null);
            user_repository_1.userRepository.create.mockResolvedValue(mockCreatedUser);
            const result = await auth_service_1.authService.register(mockRegisterData);
            // Verify password was hashed
            expect(bcryptjs_1.default.hash).toHaveBeenCalledWith('password123', 12);
            // Verify user was created with hashed password
            expect(user_repository_1.userRepository.create).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'hashed-password',
                name: 'Test User',
            });
            // Verify JWT was generated
            expect(jsonwebtoken_1.default.sign).toHaveBeenCalledWith({ userId: 'user-1', email: 'test@example.com' }, expect.any(String), expect.objectContaining({ expiresIn: expect.any(String) }));
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
            user_repository_1.userRepository.findByEmail.mockResolvedValue({
                id: 'existing-user',
                email: 'test@example.com',
            });
            await expect(auth_service_1.authService.register(mockRegisterData)).rejects.toThrow(errors_1.AppError);
            // Verify user was not created
            expect(user_repository_1.userRepository.create).not.toHaveBeenCalled();
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
        };
        /**
         * Test 3: Successfully login with valid credentials
         */
        it('should successfully login with valid credentials', async () => {
            user_repository_1.userRepository.findByEmail.mockResolvedValue(mockUser);
            bcryptjs_1.default.compare.mockResolvedValue(true);
            const result = await auth_service_1.authService.login(mockLoginData);
            // Verify password was compared
            expect(bcryptjs_1.default.compare).toHaveBeenCalledWith('password123', 'hashed-password');
            // Verify JWT was generated
            expect(jsonwebtoken_1.default.sign).toHaveBeenCalled();
            // Verify response structure
            expect(result).toEqual({
                user: {
                    id: 'user-1',
                    email: 'test@example.com',
                    name: 'Test User',
                },
                token: 'mock-jwt-token',
            });
        });
        /**
         * Test 4: Throw unauthorized error for invalid email
         */
        it('should throw unauthorized error for non-existent email', async () => {
            user_repository_1.userRepository.findByEmail.mockResolvedValue(null);
            await expect(auth_service_1.authService.login(mockLoginData)).rejects.toThrow(errors_1.AppError);
            // Verify password was not compared
            expect(bcryptjs_1.default.compare).not.toHaveBeenCalled();
        });
        /**
         * Test 5: Throw unauthorized error for wrong password
         */
        it('should throw unauthorized error for wrong password', async () => {
            user_repository_1.userRepository.findByEmail.mockResolvedValue(mockUser);
            bcryptjs_1.default.compare.mockResolvedValue(false);
            await expect(auth_service_1.authService.login(mockLoginData)).rejects.toThrow(errors_1.AppError);
        });
    });
    describe('updateProfile', () => {
        /**
         * Test 6: Throw conflict error when updating to taken email
         */
        it('should throw conflict error when updating email to one already taken', async () => {
            // Another user already has this email
            user_repository_1.userRepository.findByEmail.mockResolvedValue({
                id: 'other-user',
                email: 'taken@example.com',
            });
            await expect(auth_service_1.authService.updateProfile('user-1', { email: 'taken@example.com' })).rejects.toThrow(errors_1.AppError);
            // Verify update was not called
            expect(user_repository_1.userRepository.update).not.toHaveBeenCalled();
        });
        it('should allow updating to same email (user owns it)', async () => {
            // User owns this email
            user_repository_1.userRepository.findByEmail.mockResolvedValue({
                id: 'user-1',
                email: 'same@example.com',
            });
            user_repository_1.userRepository.update.mockResolvedValue({
                id: 'user-1',
                email: 'same@example.com',
                name: 'Updated Name',
            });
            const result = await auth_service_1.authService.updateProfile('user-1', {
                email: 'same@example.com',
                name: 'Updated Name',
            });
            expect(user_repository_1.userRepository.update).toHaveBeenCalled();
            expect(result).toBeDefined();
        });
    });
});
//# sourceMappingURL=auth.service.test.js.map