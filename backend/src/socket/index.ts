/**
 * Socket.io Event Handlers
 * Manages real-time connections and events
 */

import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  email: string;
}

/**
 * Set up Socket.io event handlers
 * @param io - Socket.io server instance
 */
export function setupSocketHandlers(io: Server): void {
  // Authentication middleware for Socket.io
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      // Allow anonymous connections but mark them
      socket.data.authenticated = false;
      return next();
    }

    try {
      const secret = process.env.JWT_SECRET || 'fallback-secret';
      const decoded = jwt.verify(token, secret) as JwtPayload;
      socket.data.userId = decoded.userId;
      socket.data.authenticated = true;
      next();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      socket.data.authenticated = false;
      next();
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join user-specific room for notifications
    if (socket.data.authenticated && socket.data.userId) {
      socket.join(`user:${socket.data.userId}`);
      console.log(`User ${socket.data.userId} joined their notification room`);
    }

    // Handle joining task room for real-time updates
    socket.on('task:subscribe', () => {
      socket.join('tasks');
      console.log(`Client ${socket.id} subscribed to task updates`);
    });

    // Handle leaving task room
    socket.on('task:unsubscribe', () => {
      socket.leave('tasks');
      console.log(`Client ${socket.id} unsubscribed from task updates`);
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
    });
  });
}
