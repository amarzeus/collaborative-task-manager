import { Request, Response, NextFunction } from 'express';
import { OrganizationService } from '../services/organization.service.js';
import { createOrganizationSchema } from '../dtos/index.js';
import { AppError } from '../lib/errors.js';

const organizationService = new OrganizationService();

export class OrganizationController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!(req as any).user) {
        throw new AppError('Authentication required', 401);
      }

      const validatedData = createOrganizationSchema.parse(req.body);
      const org = await organizationService.create(validatedData, (req as any).user.id);

      res.status(201).json(org);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!(req as any).user) {
        throw new AppError('Authentication required', 401);
      }

      const { id } = req.params;
      const org = await organizationService.getById(id, (req as any).user.id);

      res.json(org);
    } catch (error) {
      next(error);
    }
  }

  async getMyOrganizations(req: Request, res: Response, next: NextFunction) {
    try {
      if (!(req as any).user) {
        throw new AppError('Authentication required', 401);
      }

      const orgs = await organizationService.getUserOrganizations((req as any).user.id);
      res.json(orgs);
    } catch (error) {
      next(error);
    }
  }
}
