/**
 * Socket.io client for real-time communication
 */

import { io, Socket } from 'socket.io-client';
import type { Task, Notification } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export const socketClient = {
    /**
     * Connect to Socket.io server
     */
    connect(token?: string): Socket {
        if (socket?.connected) {
            return socket;
        }

        socket = io(SOCKET_URL, {
            auth: { token },
            withCredentials: true,
            transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
            console.log('Connected to Socket.io server');
            // Subscribe to task updates
            socket?.emit('task:subscribe');
        });

        socket.on('disconnect', (reason) => {
            console.log('Disconnected from Socket.io server:', reason);
        });

        socket.on('connect_error', (error) => {
            console.error('Socket.io connection error:', error);
        });

        return socket;
    },

    /**
     * Disconnect from Socket.io server
     */
    disconnect(): void {
        if (socket) {
            socket.emit('task:unsubscribe');
            socket.disconnect();
            socket = null;
        }
    },

    /**
     * Get current socket instance
     */
    getSocket(): Socket | null {
        return socket;
    },

    /**
     * Subscribe to task events
     */
    onTaskCreated(callback: (task: Task) => void): void {
        socket?.on('task:created', callback);
    },

    onTaskUpdated(callback: (task: Task) => void): void {
        socket?.on('task:updated', callback);
    },

    onTaskDeleted(callback: (data: { id: string }) => void): void {
        socket?.on('task:deleted', callback);
    },

    /**
     * Subscribe to notification events
     */
    onNotification(callback: (notification: Partial<Notification>) => void): void {
        socket?.on('notification:new', callback);
    },

    /**
     * Remove event listeners
     */
    offTaskCreated(callback?: (task: Task) => void): void {
        socket?.off('task:created', callback);
    },

    offTaskUpdated(callback?: (task: Task) => void): void {
        socket?.off('task:updated', callback);
    },

    offTaskDeleted(callback?: (data: { id: string }) => void): void {
        socket?.off('task:deleted', callback);
    },

    offNotification(callback?: (notification: Partial<Notification>) => void): void {
        socket?.off('notification:new', callback);
    },
};
