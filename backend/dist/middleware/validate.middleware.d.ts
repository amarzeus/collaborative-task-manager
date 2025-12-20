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
export declare function validateBody<T>(schema: ZodSchema<T>): (req: Request, _res: Response, next: NextFunction) => void;
/**
 * Creates a middleware that validates request query against a Zod schema
 * @param schema - Zod schema to validate against
 */
export declare function validateQuery<T>(schema: ZodSchema<T>): (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=validate.middleware.d.ts.map