"use strict";
/**
 * Authentication Routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_js_1 = require("../controllers/auth.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const validate_middleware_js_1 = require("../middleware/validate.middleware.js");
const index_js_1 = require("../dtos/index.js");
exports.authRouter = (0, express_1.Router)();
// Public routes
exports.authRouter.post('/register', (0, validate_middleware_js_1.validateBody)(index_js_1.registerSchema), auth_controller_js_1.authController.register);
exports.authRouter.post('/login', (0, validate_middleware_js_1.validateBody)(index_js_1.loginSchema), auth_controller_js_1.authController.login);
exports.authRouter.post('/logout', auth_controller_js_1.authController.logout);
// Protected routes
exports.authRouter.get('/me', auth_middleware_js_1.authenticate, auth_controller_js_1.authController.getMe);
exports.authRouter.put('/profile', auth_middleware_js_1.authenticate, (0, validate_middleware_js_1.validateBody)(index_js_1.updateProfileSchema), auth_controller_js_1.authController.updateProfile);
exports.authRouter.put('/password', auth_middleware_js_1.authenticate, (0, validate_middleware_js_1.validateBody)(index_js_1.changePasswordSchema), auth_controller_js_1.authController.changePassword);
exports.authRouter.delete('/account', auth_middleware_js_1.authenticate, (0, validate_middleware_js_1.validateBody)(index_js_1.deleteAccountSchema), auth_controller_js_1.authController.deleteAccount);
//# sourceMappingURL=auth.routes.js.map