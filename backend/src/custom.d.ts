
// Ambient declaration file for Express Request augmentation

declare namespace Express {
    interface Request {
        user?: {
            id: string;
            email: string;
            role: import('@prisma/client').Role;
            [key: string]: any;
        };
        tenantScope?: {
            organizationId: string;
            role: import('@prisma/client').OrgRole;
        };
    }
}
