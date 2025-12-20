"use strict";
/**
 * Notification Routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRouter = void 0;
const express_1 = require("express");
const notification_controller_js_1 = require("../controllers/notification.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
exports.notificationRouter = (0, express_1.Router)();
// All notification routes require authentication
exports.notificationRouter.use(auth_middleware_js_1.authenticate);
exports.notificationRouter.get('/', notification_controller_js_1.notificationController.getNotifications);
exports.notificationRouter.put('/:id/read', notification_controller_js_1.notificationController.markAsRead);
exports.notificationRouter.put('/read-all', notification_controller_js_1.notificationController.markAllAsRead);
//# sourceMappingURL=notification.routes.js.map