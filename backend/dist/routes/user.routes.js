"use strict";
/**
 * User Routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const user_controller_js_1 = require("../controllers/user.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
exports.userRouter = (0, express_1.Router)();
// All user routes require authentication
exports.userRouter.use(auth_middleware_js_1.authenticate);
exports.userRouter.get('/', user_controller_js_1.userController.getUsers);
//# sourceMappingURL=user.routes.js.map