/**
 * Authorization guard for type-safe access control
 * Implements role-based and ownership-based permissions
 */

import { Role } from '@prisma/client';

/**
 * User type for authorization checks
 */
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

/**
 * Task type for authorization checks
 */
export interface AuthTask {
  id: string;
  creatorId: string;
  assignedToId?: string | null;
}

/**
 * Generic User resource for authorization
 */
export interface AuthUserResource {
  id: string;
}

/**
 * Union type for all authorizable resources
 */
export type AuthorizableResource = AuthTask | AuthUserResource | null;

/**
 * Available actions for authorization
 */
export type Action = 'create' | 'read' | 'update' | 'delete' | 'assign' | 'manage';

/**
 * Role hierarchy - higher index = more permissions
 */
const ROLE_HIERARCHY: Record<Role, number> = {
  USER: 0,
  TEAM_LEAD: 1,
  MANAGER: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
};

/**
 * Check if a user can perform an action on a resource
 *
 * @param user - The user attempting the action
 * @param action - The action being attempted
 * @param resource - The resource being acted upon (null for create operations)
 * @returns boolean - Whether the action is permitted
 *
 * @example
 * // Check if user can delete a task
 * const canDelete = canPerformAction(user, 'delete', task);
 *
 * // Check if user can create a task (no resource needed)
 * const canCreate = canPerformAction(user, 'create', null);
 */
export function canPerformAction(
  user: AuthUser,
  action: Action,
  resource: AuthorizableResource
): boolean {
  // Super admins can do anything
  if (user.role === 'SUPER_ADMIN') {
    return true;
  }

  // Admins can do most things except modify super admins
  if (user.role === 'ADMIN') {
    // Check if trying to modify a super admin user
    if (isUserResource(resource)) {
      // Admins cannot modify super admins (checked elsewhere)
      return true;
    }
    return true;
  }

  // Create action - most authenticated users can create
  if (action === 'create') {
    return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY.USER;
  }

  // Read action - users can read tasks they're involved with
  if (action === 'read') {
    if (isTaskResource(resource)) {
      return (
        resource.creatorId === user.id ||
        resource.assignedToId === user.id ||
        ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY.MANAGER
      );
    }
    return true;
  }

  // Update action - creators, assignees, or managers+
  if (action === 'update') {
    if (isTaskResource(resource)) {
      return (
        resource.creatorId === user.id ||
        resource.assignedToId === user.id ||
        ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY.MANAGER
      );
    }
    // Users can update their own profile
    if (isUserResource(resource)) {
      return resource.id === user.id;
    }
    return false;
  }

  // Delete action - owner or admin only
  if (action === 'delete') {
    if (isTaskResource(resource)) {
      return resource.creatorId === user.id || ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY.ADMIN;
    }
    return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY.ADMIN;
  }

  // Assign action - creators, team leads+
  if (action === 'assign') {
    if (isTaskResource(resource)) {
      return (
        resource.creatorId === user.id || ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY.TEAM_LEAD
      );
    }
    return false;
  }

  // Manage action - managers and above only
  if (action === 'manage') {
    return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY.MANAGER;
  }

  return false;
}

/**
 * Type guard to check if resource is a Task
 */
function isTaskResource(resource: AuthorizableResource): resource is AuthTask {
  return resource !== null && 'creatorId' in resource;
}

/**
 * Type guard to check if resource is a User
 */
function isUserResource(resource: AuthorizableResource): resource is AuthUserResource {
  return resource !== null && !('creatorId' in resource);
}

/**
 * Check if user has a minimum role level
 */
export function hasMinimumRole(user: AuthUser, minimumRole: Role): boolean {
  return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[minimumRole];
}

/**
 * Check if user is admin or super admin
 */
export function isAdmin(user: AuthUser): boolean {
  return hasMinimumRole(user, 'ADMIN');
}
