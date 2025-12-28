/**
 * Comment Routes
 */

import { Router } from 'express';
import { commentController } from '../controllers/comment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { CreateCommentDto, UpdateCommentDto } from '../dtos/comment.dto.js';

export const commentRouter = Router();

// All comment routes require authentication
commentRouter.use(authenticate);

// List comments for a task (using taskId parameter)
// This is redundant with the task router but good for direct comment management if needed
commentRouter.get('/task/:taskId', commentController.getTaskComments);

// Create, Update, Delete
commentRouter.post('/', validateBody(CreateCommentDto), commentController.createComment);
commentRouter.put('/:id', validateBody(UpdateCommentDto), commentController.updateComment);
commentRouter.delete('/:id', commentController.deleteComment);
