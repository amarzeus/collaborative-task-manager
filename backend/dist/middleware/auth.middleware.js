"use strict";
/**
 * Authentication middleware
 * Verifies JWT tokens and attaches user to request
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_js_1 = require("../lib/errors.js");
const prisma_js_1 = require("../lib/prisma.js");
/**
 * Middleware to authenticate requests using JWT
 * Extracts token from cookies or Authorization header
 */
async function authenticate(req, _res, next) {
    try {
        // Get token from cookie or Authorization header
        const token = req.cookies?.token ||
            req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            throw errors_js_1.AppError.unauthorized('Access token required');
        }
        // Verify token
        const secret = process.env.JWT_SECRET || 'fallback-secret';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // Get user from database with role and active status
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, name: true, role: true, isActive: true },
        });
        if (!user) {
            throw errors_js_1.AppError.unauthorized('User not found');
        }
        // Check if user is active
        if (!user.isActive) {
            throw errors_js_1.AppError.forbidden('Account is suspended');
        }
        // Attach user to request
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(errors_js_1.AppError.unauthorized('Invalid token'));
        }
        else if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            next(errors_js_1.AppError.unauthorized('Token expired'));
        }
        else {
            next(error);
        }
    }
}
//# sourceMappingURL=auth.middleware.js.map