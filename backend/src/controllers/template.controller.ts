/**
 * Template Controller
 * Handles HTTP requests for task templates
 */

import { Request, Response, NextFunction } from 'express';
import { templateService } from '../services/template.service.js';
import { z } from 'zod';

// Validation schemas
const createTemplateSchema = z.object({
  name: z.string().min(1).max(50),
  title: z.string().min(1).max(100),
  description: z.string(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  isGlobal: z.boolean().optional(),
});

const updateTemplateSchema = createTemplateSchema.partial();

export const templateController = {
  /**
   * GET /api/v1/templates
   * Get all templates for the current user
   */
  async getTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const templates = await templateService.getTemplates(userId);
      res.json({
        success: true,
        data: templates,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/templates/:id
   * Get a single template by ID
   */
  async getTemplateById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const template = await templateService.getTemplateById(req.params.id, userId);
      res.json({
        success: true,
        data: template,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/templates
   * Create a new template
   */
  async createTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const data = createTemplateSchema.parse(req.body);
      const template = await templateService.createTemplate(data, userId);
      res.status(201).json({
        success: true,
        data: template,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/v1/templates/:id
   * Update a template
   */
  async updateTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const data = updateTemplateSchema.parse(req.body);
      const template = await templateService.updateTemplate(req.params.id, data, userId);
      res.json({
        success: true,
        data: template,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/templates/:id
   * Delete a template
   */
  async deleteTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      await templateService.deleteTemplate(req.params.id, userId);
      res.json({
        success: true,
        message: 'Template deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};
