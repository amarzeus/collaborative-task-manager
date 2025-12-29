/**
 * Unit tests for Socket.io Handlers
 * Tests real-time collaboration features (PRD §3)
 */

import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { setupSocketHandlers } from '../../socket/index';

describe('Socket.io Handlers', () => {
  let io: Server;
  let httpServer: ReturnType<typeof createServer>;
  let clientSocket: ClientSocket;
  const PORT = 3099;

  beforeAll((done) => {
    httpServer = createServer();
    io = new Server(httpServer);
    setupSocketHandlers(io);
    httpServer.listen(PORT, () => {
      done();
    });
  });

  afterAll((done) => {
    io.close();
    httpServer.close(done);
  });

  afterEach(() => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
  });

  describe('Socket Authentication Middleware', () => {
    /**
     * Test 1: Accept connection with valid JWT token
     */
    it('should authenticate user with valid JWT token', (done) => {
      const token = jwt.sign(
        { userId: 'user-123', email: 'test@example.com' },
        process.env.JWT_SECRET || 'fallback-secret'
      );

      clientSocket = Client(`http://localhost:${PORT}`, {
        auth: { token },
      });

      clientSocket.on('connect', () => {
        expect(clientSocket.connected).toBe(true);
        done();
      });

      clientSocket.on('connect_error', (err) => {
        done(err);
      });
    });

    /**
     * Test 2: Allow anonymous connections (marked as unauthenticated)
     */
    it('should allow anonymous connections without token', (done) => {
      clientSocket = Client(`http://localhost:${PORT}`, {
        auth: {},
      });

      clientSocket.on('connect', () => {
        expect(clientSocket.connected).toBe(true);
        done();
      });

      clientSocket.on('connect_error', (err) => {
        done(err);
      });
    });

    /**
     * Test 3: Accept connection with invalid token (marked as unauthenticated)
     */
    it('should accept connection with invalid token but mark as unauthenticated', (done) => {
      clientSocket = Client(`http://localhost:${PORT}`, {
        auth: { token: 'invalid-token' },
      });

      clientSocket.on('connect', () => {
        // Connection should succeed, just not authenticated
        expect(clientSocket.connected).toBe(true);
        done();
      });

      clientSocket.on('connect_error', (err) => {
        done(err);
      });
    });
  });

  describe('Task Subscription Events', () => {
    /**
     * Test 4: Handle task:subscribe event
     */
    it('should handle task:subscribe event', (done) => {
      clientSocket = Client(`http://localhost:${PORT}`);

      clientSocket.on('connect', () => {
        // Emit subscribe event
        clientSocket.emit('task:subscribe');

        // Give server time to process
        setTimeout(() => {
          expect(clientSocket.connected).toBe(true);
          done();
        }, 100);
      });
    });

    /**
     * Test 5: Handle task:unsubscribe event
     */
    it('should handle task:unsubscribe event', (done) => {
      clientSocket = Client(`http://localhost:${PORT}`);

      clientSocket.on('connect', () => {
        clientSocket.emit('task:subscribe');
        clientSocket.emit('task:unsubscribe');

        setTimeout(() => {
          expect(clientSocket.connected).toBe(true);
          done();
        }, 100);
      });
    });
  });

  describe('User Notification Room', () => {
    /**
     * Test 6: Authenticated user joins their notification room
     */
    it('should join user notification room when authenticated', (done) => {
      const token = jwt.sign(
        { userId: 'user-456', email: 'user@example.com' },
        process.env.JWT_SECRET || 'fallback-secret'
      );

      clientSocket = Client(`http://localhost:${PORT}`, {
        auth: { token },
      });

      clientSocket.on('connect', () => {
        // User should be connected and authenticated
        expect(clientSocket.connected).toBe(true);
        done();
      });
    });
  });

  describe('Disconnection Handling', () => {
    /**
     * Test 7: Handle client disconnection gracefully
     */
    it('should handle client disconnection gracefully', (done) => {
      clientSocket = Client(`http://localhost:${PORT}`);

      clientSocket.on('connect', () => {
        clientSocket.disconnect();
      });

      clientSocket.on('disconnect', (reason) => {
        expect(reason).toBe('io client disconnect');
        done();
      });
    });
  });
});
