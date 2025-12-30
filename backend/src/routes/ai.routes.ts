/**
 * AI Assistant Routes
 * Chat and conversation management endpoints
 */

import { Router } from 'express';
import { aiController } from '../controllers/ai.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { tenantMiddleware } from '../middleware/tenant.middleware.js';

const router = Router();

// All AI routes require authentication
router.use(authenticate);
router.use(tenantMiddleware);

/**
 * @route   POST /api/v1/ai/chat
 * @desc    Send a message to AI assistant
 * @access  Authenticated
 */
router.post('/chat', aiController.chat as any);

/**
 * @route   GET /api/v1/ai/conversation
 * @desc    Get conversation history
 * @access  Authenticated
 */
router.get('/conversation', aiController.getConversation as any);

/**
 * @route   DELETE /api/v1/ai/conversation
 * @desc    Clear conversation history
 * @access  Authenticated
 */
router.delete('/conversation', aiController.clearConversation as any);

/**
 * @route   GET /api/v1/ai/functions
 * @desc    Get available AI functions
 * @access  Authenticated
 */
router.get('/functions', aiController.getFunctions as any);

/**
 * @swagger
 * /ai/categorize:
 *   post:
 *     tags: [AI]
 *     summary: Auto-categorize a task
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *     responses:
 *       200: { description: Suggested priority and labels }
 */
router.post('/categorize', aiController.categorize as any);

export const aiRouter = router;
