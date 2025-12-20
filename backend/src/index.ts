/**
 * Application entry point
 * Sets up Express server with Socket.io for real-time communication
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import { authRouter } from './routes/auth.routes.js';
import { taskRouter } from './routes/task.routes.js';
import { userRouter } from './routes/user.routes.js';
import { notificationRouter } from './routes/notification.routes.js';
import analyticsRouter from './routes/analytics.routes.js';
import adminRouter from './routes/admin.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { setupSocketHandlers } from './socket/index.js';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io setup with CORS
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    },
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/tasks', taskRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/admin', adminRouter);

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
app.use(errorHandler);

// Setup Socket.io handlers
setupSocketHandlers(io);

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Socket.io listening for connections`);
});

export { app, io };
