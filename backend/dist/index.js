"use strict";
/**
 * Application entry point
 * Sets up Express server with Socket.io for real-time communication
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_js_1 = require("./routes/auth.routes.js");
const task_routes_js_1 = require("./routes/task.routes.js");
const user_routes_js_1 = require("./routes/user.routes.js");
const notification_routes_js_1 = require("./routes/notification.routes.js");
const analytics_routes_js_1 = __importDefault(require("./routes/analytics.routes.js"));
const admin_routes_js_1 = __importDefault(require("./routes/admin.routes.js"));
const error_middleware_js_1 = require("./middleware/error.middleware.js");
const index_js_1 = require("./socket/index.js");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const httpServer = (0, http_1.createServer)(app);
// Socket.io setup with CORS
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    },
});
exports.io = io;
// Make io accessible to routes
app.set('io', io);
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// API Routes
app.use('/api/v1/auth', auth_routes_js_1.authRouter);
app.use('/api/v1/tasks', task_routes_js_1.taskRouter);
app.use('/api/v1/users', user_routes_js_1.userRouter);
app.use('/api/v1/notifications', notification_routes_js_1.notificationRouter);
app.use('/api/v1/analytics', analytics_routes_js_1.default);
app.use('/api/v1/admin', admin_routes_js_1.default);
// Root route
app.get('/', (_req, res) => {
    res.json({
        message: 'Welcome to Collaborative Task Manager API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            auth: '/api/v1/auth',
            tasks: '/api/v1/tasks',
            users: '/api/v1/users',
            notifications: '/api/v1/notifications',
            analytics: '/api/v1/analytics',
            admin: '/api/v1/admin'
        }
    });
});
// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Error handling middleware
app.use(error_middleware_js_1.errorHandler);
// Setup Socket.io handlers
(0, index_js_1.setupSocketHandlers)(io);
// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Socket.io listening for connections`);
});
//# sourceMappingURL=index.js.map