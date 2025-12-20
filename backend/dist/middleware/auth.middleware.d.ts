/**
 * Authentication middleware
 * Verifies JWT tokens and attaches user to request
 */
import { Request, Response, NextFunction } from 'express';
export interface JwtPayload {
    userId: string;
    email: string;
}
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        name: string;
    };
}
/**
 * Middleware to authenticate requests using JWT
 * Extracts token from cookies or Authorization header
 */
export declare function authenticate(req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=auth.middleware.d.ts.map