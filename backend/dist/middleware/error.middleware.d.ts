/**
 * Global error handling middleware
 * Catches all errors and returns consistent JSON responses
 */
import { Request, Response, NextFunction } from 'express';
export declare function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void;
//# sourceMappingURL=error.middleware.d.ts.map