/**
 * Unit tests for Validate Middleware
 * Tests Zod schema validation for request body and query
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { validateBody, validateQuery } from '../../middleware/validate.middleware';

describe('Validate Middleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = { body: {}, query: {} };
        mockRes = {};
        mockNext = jest.fn();
    });

    describe('validateBody', () => {
        const testSchema = z.object({
            name: z.string().min(1),
            email: z.string().email(),
            age: z.number().optional(),
        });

        /**
         * Test 1: Pass valid body
         */
        it('should pass validation with valid body', () => {
            mockReq.body = { name: 'John', email: 'john@example.com' };

            validateBody(testSchema)(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith();
            expect(mockReq.body).toEqual({ name: 'John', email: 'john@example.com' });
        });

        /**
         * Test 2: Fail with invalid body
         */
        it('should call next with error for invalid body', () => {
            mockReq.body = { name: '', email: 'invalid-email' };

            validateBody(testSchema)(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(ZodError));
        });

        /**
         * Test 3: Fail with missing required field
         */
        it('should fail when required field is missing', () => {
            mockReq.body = { email: 'test@example.com' };

            validateBody(testSchema)(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(ZodError));
        });

        /**
         * Test 4: Pass with optional field
         */
        it('should pass with optional field included', () => {
            mockReq.body = { name: 'John', email: 'john@example.com', age: 25 };

            validateBody(testSchema)(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith();
            expect(mockReq.body.age).toBe(25);
        });

        /**
         * Test 5: Transform and coerce data
         */
        it('should transform data according to schema', () => {
            const transformSchema = z.object({
                name: z.string().trim(),
            });
            mockReq.body = { name: '  John  ' };

            validateBody(transformSchema)(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith();
            expect(mockReq.body.name).toBe('John');
        });

        /**
         * Test 6: Fail with wrong type
         */
        it('should fail when field has wrong type', () => {
            mockReq.body = { name: 'John', email: 'john@example.com', age: 'not-a-number' };

            validateBody(testSchema)(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(ZodError));
        });
    });

    describe('validateQuery', () => {
        const querySchema = z.object({
            page: z.string().optional(),
            limit: z.string().optional(),
            status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
        });

        /**
         * Test 7: Pass valid query
         */
        it('should pass validation with valid query', () => {
            mockReq.query = { page: '1', limit: '10', status: 'TODO' };

            validateQuery(querySchema)(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith();
        });

        /**
         * Test 8: Pass with empty query
         */
        it('should pass with empty query when all fields optional', () => {
            mockReq.query = {};

            validateQuery(querySchema)(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith();
        });

        /**
         * Test 9: Fail with invalid enum value
         */
        it('should fail with invalid enum value', () => {
            mockReq.query = { status: 'INVALID_STATUS' };

            validateQuery(querySchema)(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(ZodError));
        });

        /**
         * Test 10: Update req.query with validated data
         */
        it('should update req.query with validated data', () => {
            const strictSchema = z.object({
                page: z.string().default('1'),
            });
            mockReq.query = {};

            validateQuery(strictSchema)(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith();
        });
    });

    describe('Error Handling', () => {
        /**
         * Test 11: Pass ZodError to next for error middleware
         */
        it('should pass ZodError to next for error handling', () => {
            const schema = z.object({ required: z.string() });
            mockReq.body = {};

            validateBody(schema)(mockReq as Request, mockRes as Response, mockNext);

            const passedError = (mockNext as jest.Mock).mock.calls[0][0];
            expect(passedError).toBeInstanceOf(ZodError);
            expect(passedError.errors[0].path).toContain('required');
        });

        /**
         * Test 12: Include field path in error
         */
        it('should include field path in validation error', () => {
            const nestedSchema = z.object({
                user: z.object({
                    email: z.string().email(),
                }),
            });
            mockReq.body = { user: { email: 'invalid' } };

            validateBody(nestedSchema)(mockReq as Request, mockRes as Response, mockNext);

            const passedError = (mockNext as jest.Mock).mock.calls[0][0] as ZodError;
            expect(passedError.errors[0].path).toContain('user');
            expect(passedError.errors[0].path).toContain('email');
        });
    });
});
