/**
 * Application entry point
 * Sets up Express server with Socket.io for real-time communication
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './lib/swagger.js';
import { apiLimiter, authLimiter, aiLimiter } from './middleware/rateLimit.middleware.js';

import { authRouter } from './routes/auth.routes.js';
import { taskRouter } from './routes/task.routes.js';
import { userRouter } from './routes/user.routes.js';
import { notificationRouter } from './routes/notification.routes.js';
import analyticsRouter from './routes/analytics.routes.js';
import adminRouter from './routes/admin.routes.js';
import templateRouter from './routes/template.routes.js';
import { commentRouter } from './routes/comment.routes.js';
import uploadRouter from './routes/upload.routes.js';
import organizationRouter from './routes/organization.routes.js';
import { teamRouter } from './routes/team.routes.js';
import { managerRouter } from './routes/manager.routes.js';
import { aiRouter } from './routes/ai.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { setupSocketHandlers } from './socket/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin for uploads
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Input sanitization (XSS protection)
import { sanitizeInput } from './middleware/sanitize.middleware.js';
app.use(sanitizeInput);

app.use('/api', apiLimiter); // Apply rate limiting to all API routes

// Serve static files (avatars)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Documentation (Swagger UI)
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'TaskFlow API Docs',
  })
);

// API Routes with rate limiting
app.use('/api/v1/auth', authLimiter, authRouter); // Stricter limit for auth
app.use('/api/v1/tasks', taskRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/templates', templateRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/upload', uploadRouter);
app.use('/api/v1/organizations', organizationRouter);
app.use('/api/v1/teams', teamRouter);
app.use('/api/v1/manager', managerRouter);
app.use('/api/v1/ai', aiLimiter, aiRouter); // AI-specific rate limit

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
      admin: '/api/v1/admin',
      templates: '/api/v1/templates',
    },
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
