/**
 * Task Routes
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task CRUD operations
 */

import { Router, Request, Response, NextFunction } from 'express';
import { taskController } from '../controllers/task.controller.js';
import { commentController } from '../controllers/comment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { tenantMiddleware } from '../middleware/tenant.middleware.js';
import { validateBody, validateQuery } from '../middleware/validate.middleware.js';
import { createTaskSchema, updateTaskSchema, taskQuerySchema } from '../dtos/index.js';

export const taskRouter = Router();

// All task routes require authentication and tenant context
taskRouter.use(authenticate);
taskRouter.use(tenantMiddleware);

/**
 * @swagger
 * /tasks/bulk:
 *   post:
 *     tags: [Tasks]
 *     summary: Bulk update tasks
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Tasks updated }
 */
taskRouter.post('/bulk', taskController.bulkUpdate as any);

/**
 * @swagger
 * /tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: Get all tasks with filters
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: status
 *         in: query
 *         schema: { type: string, enum: [TODO, IN_PROGRESS, REVIEW, COMPLETED] }
 *       - name: priority
 *         in: query
 *         schema: { type: string, enum: [LOW, MEDIUM, HIGH, URGENT] }
 *       - name: assignedToMe
 *         in: query
 *         schema: { type: boolean }
 *     responses:
 *       200: { description: List of tasks }
 *   post:
 *     tags: [Tasks]
 *     summary: Create a new task
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
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH, URGENT] }
 *               dueDate: { type: string, format: date-time }
 *               assignedToId: { type: string }
 *     responses:
 *       201: { description: Task created }
 */
taskRouter.get('/', validateQuery(taskQuerySchema), taskController.getTasks as any);
taskRouter.post('/', validateBody(createTaskSchema), taskController.createTask as any);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     tags: [Tasks]
 *     summary: Get task by ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Task details }
 *       404: { description: Task not found }
 *   put:
 *     tags: [Tasks]
 *     summary: Update a task
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Task updated }
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete a task
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Task deleted }
 */
taskRouter.get('/:id', taskController.getTask as any);
taskRouter.put('/:id', validateBody(updateTaskSchema), taskController.updateTask as any);
taskRouter.delete('/:id', taskController.deleteTask as any);

/**
 * @swagger
 * /tasks/{taskId}/comments:
 *   get:
 *     tags: [Tasks]
 *     summary: Get comments for a task
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: taskId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of comments }
 */
taskRouter.get('/:taskId/comments', commentController.getTaskComments as any);

