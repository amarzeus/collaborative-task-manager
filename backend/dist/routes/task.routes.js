"use strict";
/**
 * Task Routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskRouter = void 0;
const express_1 = require("express");
const task_controller_js_1 = require("../controllers/task.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const validate_middleware_js_1 = require("../middleware/validate.middleware.js");
const index_js_1 = require("../dtos/index.js");
exports.taskRouter = (0, express_1.Router)();
// All task routes require authentication
exports.taskRouter.use(auth_middleware_js_1.authenticate);
exports.taskRouter.get('/', (0, validate_middleware_js_1.validateQuery)(index_js_1.taskQuerySchema), task_controller_js_1.taskController.getTasks);
exports.taskRouter.get('/:id', task_controller_js_1.taskController.getTask);
exports.taskRouter.post('/', (0, validate_middleware_js_1.validateBody)(index_js_1.createTaskSchema), task_controller_js_1.taskController.createTask);
exports.taskRouter.put('/:id', (0, validate_middleware_js_1.validateBody)(index_js_1.updateTaskSchema), task_controller_js_1.taskController.updateTask);
exports.taskRouter.delete('/:id', task_controller_js_1.taskController.deleteTask);
//# sourceMappingURL=task.routes.js.map