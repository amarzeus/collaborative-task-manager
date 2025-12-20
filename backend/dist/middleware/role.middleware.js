"use strict";
/**
 * Role-based Authorization Middleware
 * Controls access to routes based on user roles
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
exports.requireAdmin = requireAdmin;
exports.requireManager = requireManager;
exports.requireTeamLead = requireTeamLead;
exports.hasPermission = hasPermission;
exports.isRoleAtLeast = isRoleAtLeast;
exports.requireMinRole = requireMinRole;
const client_1 = require("@prisma/client");
const errors_js_1 = require("../lib/errors.js");
/**
 * Middleware factory to restrict access to specific roles
 * @param allowedRoles - Array of roles that can access the route
 */
function requireRole(...allowedRoles) {
    return (req, _res, next) => {
        if (!req.user) {
            return next(errors_js_1.AppError.unauthorized('Authentication required'));
        }
        const userRole = req.user.role;
        if (!userRole || !allowedRoles.includes(userRole)) {
            return next(errors_js_1.AppError.forbidden('Insufficient permissions'));
        }
        next();
    };
}
/**
 * Middleware to require Admin or Super Admin role
 * Shorthand for common admin-only routes
 */
function requireAdmin() {
    return requireRole(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN);
}
/**
 * Middleware to require Manager, Admin, or Super Admin role
 * For routes that managers and above can access
 */
function requireManager() {
    return requireRole(client_1.Role.MANAGER, client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN);
}
/**
 * Middleware to require Team Lead or higher role
 */
function requireTeamLead() {
    return requireRole(client_1.Role.TEAM_LEAD, client_1.Role.MANAGER, client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN);
}
/**
 * Check if user has a specific permission
 * Currently role-based, can be extended to granular permissions
 */
function hasPermission(role, requiredRoles) {
    return requiredRoles.includes(role);
}
/**
 * Role hierarchy check - higher roles include lower role permissions
 */
const roleHierarchy = {
    [client_1.Role.USER]: 1,
    [client_1.Role.TEAM_LEAD]: 2,
    [client_1.Role.MANAGER]: 3,
    [client_1.Role.ADMIN]: 4,
    [client_1.Role.SUPER_ADMIN]: 5,
};
/**
 * Check if a role is at least as high as another
 * @param userRole - The user's role
 * @param requiredRole - The minimum required role
 */
function isRoleAtLeast(userRole, requiredRole) {
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
/**
 * Middleware to require a minimum role level (hierarchical check)
 * @param minRole - The minimum role required
 */
function requireMinRole(minRole) {
    return (req, _res, next) => {
        if (!req.user) {
            return next(errors_js_1.AppError.unauthorized('Authentication required'));
        }
        const userRole = req.user.role;
        if (!userRole || !isRoleAtLeast(userRole, minRole)) {
            return next(errors_js_1.AppError.forbidden('Insufficient permissions'));
        }
        next();
    };
}
//# sourceMappingURL=role.middleware.js.map