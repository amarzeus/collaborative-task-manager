"use strict";
/**
 * User Controller
 * Handles HTTP requests for user management
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const user_repository_js_1 = require("../repositories/user.repository.js");
exports.userController = {
    /**
     * GET /api/v1/users
     * Get all users (for assignment dropdown)
     */
    async getUsers(_req, res, next) {
        try {
            const users = await user_repository_js_1.userRepository.findAll();
            res.json({
                success: true,
                data: users,
            });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=user.controller.js.map