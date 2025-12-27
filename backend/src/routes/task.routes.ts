/**
 * Task Routes
 */

import { Router } from 'express';
import { taskController } from '../controllers/task.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody, validateQuery } from '../middleware/validate.middleware.js';
import { createTaskSchema, updateTaskSchema, taskQuerySchema } from '../dtos/index.js';

export const taskRouter = Router();

// All task routes require authentication
taskRouter.use(authenticate);

// Bulk operations (before :id routes to avoid conflict)
taskRouter.post('/bulk', taskController.bulkUpdate);

taskRouter.get('/', validateQuery(taskQuerySchema), taskController.getTasks);
taskRouter.get('/:id', taskController.getTask);
taskRouter.post('/', validateBody(createTaskSchema), taskController.createTask);
taskRouter.put('/:id', validateBody(updateTaskSchema), taskController.updateTask);
taskRouter.delete('/:id', taskController.deleteTask);

