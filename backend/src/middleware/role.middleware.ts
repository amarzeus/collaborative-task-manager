/**
 * Role-based Authorization Middleware
 * Controls access to routes based on user roles
 */

import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AppError } from '../lib/errors.js';


/**
 * Middleware factory to restrict access to specific roles
 * @param allowedRoles - Array of roles that can access the route
 */
export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!(req as any).user) {
      return next(AppError.unauthorized('Authentication required'));
    }

    const userRole = (req as any).user.role;
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
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!(req as any).user) {
      return next(AppError.unauthorized('Authentication required'));
    }

    const userRole = (req as any).user.role;
    if (!userRole || !isRoleAtLeast(userRole, minRole)) {
      return next(AppError.forbidden('Insufficient permissions'));
    }

    next();
  };
}

// ============================================
// v2.0 Multi-Tenant RBAC Guards
// ============================================

import { OrgRole, TeamRole } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

/**
 * Organization role hierarchy
 */
const orgRoleHierarchy: Record<OrgRole, number> = {
  [OrgRole.MEMBER]: 1,
  [OrgRole.MANAGER]: 2,
  [OrgRole.SUPER_ADMIN]: 3,
};

/**
 * Check if org role is at least as high as required
 */
export function isOrgRoleAtLeast(userOrgRole: OrgRole, requiredRole: OrgRole): boolean {
  return orgRoleHierarchy[userOrgRole] >= orgRoleHierarchy[requiredRole];
}

/**
 * Middleware to require a minimum organization role
 * Requires tenantMiddleware to have run first
 */
export function requireOrgRole(minRole: OrgRole) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!(req as any).tenantScope) {
      return next(AppError.forbidden('Organization context required'));
    }

    const userOrgRole = (req as any).tenantScope.role as OrgRole;
    if (!userOrgRole || !isOrgRoleAtLeast(userOrgRole, minRole)) {
      return next(AppError.forbidden('Insufficient organization permissions'));
    }

    next();
  };
}

/**
 * Shorthand: Require Org Manager or Super Admin
 */
export function requireOrgManager() {
  return requireOrgRole(OrgRole.MANAGER);
}

/**
 * Shorthand: Require Org Super Admin
 */
export function requireOrgAdmin() {
  return requireOrgRole(OrgRole.SUPER_ADMIN);
}

/**
 * Middleware to require Team Leader role for a specific team
 * Fetches team membership and validates role
 */
export function requireTeamLeader(teamIdParam = 'id') {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!(req as any).user) {
        return next(AppError.unauthorized('Authentication required'));
      }

      const teamId = req.params[teamIdParam];
      if (!teamId) {
        return next(AppError.badRequest('Team ID required'));
      }

      const membership = await prisma.teamMembership.findUnique({
        where: {
          userId_teamId: {
            userId: (req as any).user.id,
            teamId,
          },
        },
      });

      if (!membership || membership.role !== TeamRole.LEADER) {
        return next(AppError.forbidden('Only team leaders can perform this action'));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
