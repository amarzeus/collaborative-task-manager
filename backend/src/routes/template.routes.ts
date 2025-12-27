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
router.get('/', templateController.getTemplates);

// GET /api/v1/templates/:id - Get a single template
router.get('/:id', templateController.getTemplateById);

// POST /api/v1/templates - Create a new template
router.post('/', templateController.createTemplate);

// PUT /api/v1/templates/:id - Update a template
router.put('/:id', templateController.updateTemplate);

// DELETE /api/v1/templates/:id - Delete a template
router.delete('/:id', templateController.deleteTemplate);

export default router;
