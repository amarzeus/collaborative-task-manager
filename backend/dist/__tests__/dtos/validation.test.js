"use strict";
/**
 * Unit tests for DTO Validation (Zod Schemas)
 * Tests input validation for API requests
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../dtos/index");
describe('DTO Validation', () => {
    describe('registerSchema', () => {
        /**
         * Test 1: Accept valid registration data
         */
        it('should accept valid registration data', () => {
            const validData = {
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User',
            };
            const result = index_1.registerSchema.safeParse(validData);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.email).toBe('test@example.com');
                expect(result.data.name).toBe('Test User');
            }
        });
        /**
         * Test 2: Reject invalid email format
         */
        it('should reject invalid email format', () => {
            const invalidData = {
                email: 'not-an-email',
                password: 'password123',
                name: 'Test User',
            };
            const result = index_1.registerSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].path).toContain('email');
            }
        });
        /**
         * Test 3: Reject short password
         */
        it('should reject password shorter than 6 characters', () => {
            const invalidData = {
                email: 'test@example.com',
                password: '12345',
                name: 'Test User',
            };
            const result = index_1.registerSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].path).toContain('password');
            }
        });
        /**
         * Test 4: Reject empty name
         */
        it('should reject empty name', () => {
            const invalidData = {
                email: 'test@example.com',
                password: 'password123',
                name: '',
            };
            const result = index_1.registerSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].path).toContain('name');
            }
        });
    });
    describe('createTaskSchema', () => {
        const validTaskData = {
            title: 'Test Task',
            description: 'This is a test task description',
            dueDate: '2024-12-31T00:00:00.000Z',
            priority: 'MEDIUM',
            status: 'TODO',
        };
        /**
         * Test 5: Accept valid task data
         */
        it('should accept valid task data', () => {
            const result = index_1.createTaskSchema.safeParse(validTaskData);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.title).toBe('Test Task');
                expect(result.data.priority).toBe('MEDIUM');
            }
        });
        /**
         * Test 6: Reject empty title
         */
        it('should reject empty title', () => {
            const invalidData = {
                ...validTaskData,
                title: '',
            };
            const result = index_1.createTaskSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].path).toContain('title');
            }
        });
        /**
         * Test 7: Reject title longer than 100 characters
         */
        it('should reject title longer than 100 characters', () => {
            const invalidData = {
                ...validTaskData,
                title: 'A'.repeat(101),
            };
            const result = index_1.createTaskSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].path).toContain('title');
            }
        });
        /**
         * Test 8: Reject invalid priority enum value
         */
        it('should reject invalid priority enum value', () => {
            const invalidData = {
                ...validTaskData,
                priority: 'INVALID_PRIORITY',
            };
            const result = index_1.createTaskSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].path).toContain('priority');
            }
        });
        /**
         * Test 9: Reject invalid status enum value
         */
        it('should reject invalid status enum value', () => {
            const invalidData = {
                ...validTaskData,
                status: 'INVALID_STATUS',
            };
            const result = index_1.createTaskSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].path).toContain('status');
            }
        });
        /**
         * Test 10: Reject invalid date format
         */
        it('should reject invalid date format', () => {
            const invalidData = {
                ...validTaskData,
                dueDate: 'not-a-date',
            };
            const result = index_1.createTaskSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].path).toContain('dueDate');
            }
        });
        /**
         * Test 11: Accept valid assignedToId (UUID)
         */
        it('should accept valid UUID for assignedToId', () => {
            const dataWithAssignee = {
                ...validTaskData,
                assignedToId: '123e4567-e89b-12d3-a456-426614174000',
            };
            const result = index_1.createTaskSchema.safeParse(dataWithAssignee);
            expect(result.success).toBe(true);
        });
        /**
         * Test 12: Reject invalid UUID for assignedToId
         */
        it('should reject invalid UUID for assignedToId', () => {
            const invalidData = {
                ...validTaskData,
                assignedToId: 'not-a-uuid',
            };
            const result = index_1.createTaskSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].path).toContain('assignedToId');
            }
        });
    });
    describe('taskQuerySchema', () => {
        /**
         * Test 13: Accept valid query parameters
         */
        it('should accept valid query parameters', () => {
            const validQuery = {
                status: 'TODO',
                priority: 'HIGH',
                assignedToMe: 'true',
                sortBy: 'dueDate',
                sortOrder: 'asc',
            };
            const result = index_1.taskQuerySchema.safeParse(validQuery);
            expect(result.success).toBe(true);
        });
        /**
         * Test 14: Accept empty query (all optional)
         */
        it('should accept empty query object', () => {
            const result = index_1.taskQuerySchema.safeParse({});
            expect(result.success).toBe(true);
        });
    });
});
//# sourceMappingURL=validation.test.js.map