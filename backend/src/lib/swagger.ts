/**
 * Swagger/OpenAPI Configuration
 * API documentation setup
 */

import swaggerJsdoc from 'swagger-jsdoc';
import type { Options } from 'swagger-jsdoc';

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TaskFlow API',
      version: '2.0.0',
      description: `
## TaskFlow - Collaborative Task Management API

A production-ready REST API for task management with:
- 🔐 JWT Authentication
- 👥 Multi-tenancy (Organizations & Teams)
- 🤖 AI Assistant Integration
- 📊 Analytics Dashboard
- 🔔 Real-time Notifications

### Rate Limits
- **Auth endpoints**: 10 requests/15 minutes
- **AI endpoints**: 20 requests/minute
- **General API**: 100 requests/15 minutes
            `,
      contact: {
        name: 'API Support',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: '/api/v1',
        description: 'API v1',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
        },
      },
      schemas: {
        Task: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'] },
            priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
            dueDate: { type: 'string', format: 'date-time' },
            creatorId: { type: 'string' },
            assignedToId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            role: {
              type: 'string',
              enum: ['USER', 'TEAM_LEAD', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'],
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Tasks', description: 'Task CRUD operations' },
      { name: 'Users', description: 'User management' },
      { name: 'Teams', description: 'Team management' },
      { name: 'Analytics', description: 'Analytics and reporting' },
      { name: 'AI', description: 'AI assistant endpoints' },
      { name: 'Admin', description: 'Admin operations' },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to route files
};

export const swaggerSpec = swaggerJsdoc(options);
