"use strict";
/**
 * Request validation middleware factory
 * Uses Zod schemas for runtime validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
exports.validateQuery = validateQuery;
/**
 * Creates a middleware that validates request body against a Zod schema
 * @param schema - Zod schema to validate against
 */
function validateBody(schema) {
    return (req, _res, next) => {
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
function validateQuery(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.query);
        if (!result.success) {
            next(result.error);
            return;
        }
        req.query = result.data;
        next();
    };
}
//# sourceMappingURL=validate.middleware.js.map