/**
 * Role-based Authorization Middleware
 * Controls access to routes based on user roles
 */
import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import type { AuthenticatedRequest } from './auth.middleware.js';
/**
 * Middleware factory to restrict access to specific roles
 * @param allowedRoles - Array of roles that can access the route
 */
export declare function requireRole(...allowedRoles: Role[]): (req: AuthenticatedRequest, _res: Response, next: NextFunction) => void;
/**
 * Middleware to require Admin or Super Admin role
 * Shorthand for common admin-only routes
 */
export declare function requireAdmin(): (req: AuthenticatedRequest, _res: Response, next: NextFunction) => void;
/**
 * Middleware to require Manager, Admin, or Super Admin role
 * For routes that managers and above can access
 */
export declare function requireManager(): (req: AuthenticatedRequest, _res: Response, next: NextFunction) => void;
/**
 * Middleware to require Team Lead or higher role
 */
export declare function requireTeamLead(): (req: AuthenticatedRequest, _res: Response, next: NextFunction) => void;
/**
 * Check if user has a specific permission
 * Currently role-based, can be extended to granular permissions
 */
export declare function hasPermission(role: Role, requiredRoles: Role[]): boolean;
/**
 * Check if a role is at least as high as another
 * @param userRole - The user's role
 * @param requiredRole - The minimum required role
 */
export declare function isRoleAtLeast(userRole: Role, requiredRole: Role): boolean;
/**
 * Middleware to require a minimum role level (hierarchical check)
 * @param minRole - The minimum role required
 */
export declare function requireMinRole(minRole: Role): (req: AuthenticatedRequest, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=role.middleware.d.ts.map