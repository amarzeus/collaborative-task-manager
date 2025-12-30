
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';

/**
 * Middleware to extract organization context from headers or params
 * and validate membership. Sets (req as any).tenantScope if valid.
 */
export const tenantMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1. Extract Organization ID from Header specificly (x-organization-id) 
        // or Params (if route has :orgId)
        const orgId = req.headers['x-organization-id'] as string || req.params.orgId;

        // If no org context, we are in Individual Mode or Global context
        if (!orgId) {
            return next();
        }

        // 2. Validate Membership if user is authenticated
        if ((req as any).user) {
            const membership = await prisma.membership.findUnique({
                where: {
                    userId_organizationId: {
                        userId: (req as any).user.id,
                        organizationId: orgId,
                    },
                },
            });

            if (!membership) {
                // Provided orgId but not a member -> Access Denied
                throw new AppError('You are not a member of this organization', 403);
            }

            // 3. Set Tenant Scope
            (req as any).tenantScope = {
                organizationId: orgId,
                role: membership.role,
            };
        }

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Enforces that a request MUST have a valid organization context
 */
export const requireOrganization = (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).tenantScope) {
        return next(new AppError('Organization context required', 400));
    }
    next();
};
