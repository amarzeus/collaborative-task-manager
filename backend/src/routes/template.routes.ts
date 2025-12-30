/**
 * Template Routes
 * API endpoints for task templates
 */

import { Router } from 'express';
import { templateController } from '../controllers/template.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/templates - Get all templates for current user
router.get('/', templateController.getTemplates as any);

// GET /api/v1/templates/:id - Get a single template
router.get('/:id', templateController.getTemplateById as any);

// POST /api/v1/templates - Create a new template
router.post('/', templateController.createTemplate as any);

// PUT /api/v1/templates/:id - Update a template
router.put('/:id', templateController.updateTemplate as any);

// DELETE /api/v1/templates/:id - Delete a template
router.delete('/:id', templateController.deleteTemplate as any);

export default router;
