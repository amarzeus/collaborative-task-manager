/**
 * Request validation middleware factory
 * Uses Zod schemas for runtime validation
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Creates a middleware that validates request body against a Zod schema
 * @param schema - Zod schema to validate against
 */
export function validateBody<T>(schema: ZodSchema<T>) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            next(result.error);
            return;
        }

        req.body = result.data;
        next();
    };
}

/**
 * Creates a middleware that validates request query against a Zod schema
 * @param schema - Zod schema to validate against
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.query);

        if (!result.success) {
            next(result.error);
            return;
        }

        req.query = result.data as typeof req.query;
        next();
    };
}
