/**
 * Task Controller
 * Handles HTTP requests for task management
 */
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
export declare const taskController: {
    /**
     * GET /api/v1/tasks
     * Get all tasks with optional filtering
     */
    getTasks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/v1/tasks/:id
     * Get a single task by ID
     */
    getTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /api/v1/tasks
     * Create a new task
     */
    createTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * PUT /api/v1/tasks/:id
     * Update a task
     */
    updateTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * DELETE /api/v1/tasks/:id
     * Delete a task
     */
    deleteTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=task.controller.d.ts.map