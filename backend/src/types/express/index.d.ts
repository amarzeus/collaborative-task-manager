import { OrgRole, Role } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
        [key: string]: any;
      };
      tenantScope?: {
        organizationId: string;
        role: OrgRole;
      };
    }
  }
}
