/**
 * Role-based Authorization Middleware
 * Controls access to routes based on user roles
 */

import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AppError } from '../lib/errors.js';
import type { AuthenticatedRequest } from './auth.middleware.js';

/**
 * Middleware factory to restrict access to specific roles
 * @param allowedRoles - Array of roles that can access the route
 */
export function requireRole(...allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required'));
    }

    const userRole = req.user.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return next(AppError.forbidden('Insufficient permissions'));
    }

    next();
  };
}

/**
 * Middleware to require Admin or Super Admin role
 * Shorthand for common admin-only routes
 */
export function requireAdmin() {
  return requireRole(Role.ADMIN, Role.SUPER_ADMIN);
}

/**
 * Middleware to require Manager, Admin, or Super Admin role
 * For routes that managers and above can access
 */
export function requireManager() {
  return requireRole(Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN);
}

/**
 * Middleware to require Team Lead or higher role
 */
export function requireTeamLead() {
  return requireRole(Role.TEAM_LEAD, Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN);
}

/**
 * Check if user has a specific permission
 * Currently role-based, can be extended to granular permissions
 */
export function hasPermission(role: Role, requiredRoles: Role[]): boolean {
  return requiredRoles.includes(role);
}

/**
 * Role hierarchy check - higher roles include lower role permissions
 */
const roleHierarchy: Record<Role, number> = {
  [Role.USER]: 1,
  [Role.TEAM_LEAD]: 2,
  [Role.MANAGER]: 3,
  [Role.ADMIN]: 4,
  [Role.SUPER_ADMIN]: 5,
};

/**
 * Check if a role is at least as high as another
 * @param userRole - The user's role
 * @param requiredRole - The minimum required role
 */
export function isRoleAtLeast(userRole: Role, requiredRole: Role): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Middleware to require a minimum role level (hierarchical check)
 * @param minRole - The minimum role required
 */
export function requireMinRole(minRole: Role) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required'));
    }

    const userRole = req.user.role;
    if (!userRole || !isRoleAtLeast(userRole, minRole)) {
      return next(AppError.forbidden('Insufficient permissions'));
    }

    next();
  };
}
