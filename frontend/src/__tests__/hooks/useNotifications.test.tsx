/**
 * Unit tests for useNotifications hook
 * Tests notification fetching and mark as read operations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../../hooks/useNotifications';

// Mock the API and socket modules
vi.mock('../../lib/api', () => ({
    notificationApi: {
        getAll: vi.fn(),
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
    },
}));

vi.mock('../../lib/socket', () => ({
    socketClient: {
        onNotification: vi.fn(),
        offNotification: vi.fn(),
    },
}));

import { notificationApi } from '../../lib/api';

// Create a wrapper with QueryClientProvider
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });
    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

const mockNotifications = [
    { id: 'notif-1', title: 'New Task', message: 'You were assigned a task', read: false },
    { id: 'notif-2', title: 'Comment', message: 'New comment on task', read: true },
];

describe('Notification Hooks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('useNotifications', () => {
        /**
         * Test 1: Fetch all notifications
         */
        it('should fetch all notifications', async () => {
            (notificationApi.getAll as any).mockResolvedValue(mockNotifications);

            const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockNotifications);
        });

        /**
         * Test 2: Start with empty toasts
         */
        it('should start with empty toasts array', async () => {
            (notificationApi.getAll as any).mockResolvedValue([]);

            const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

            expect(result.current.toasts).toEqual([]);
        });

        /**
         * Test 3: Provide removeToast function
         */
        it('should provide removeToast function', async () => {
            (notificationApi.getAll as any).mockResolvedValue([]);

            const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

            expect(typeof result.current.removeToast).toBe('function');
        });
    });

    describe('useMarkAsRead', () => {
        /**
         * Test 4: Mark single notification as read
         */
        it('should mark notification as read', async () => {
            (notificationApi.markAsRead as any).mockResolvedValue({});

            const { result } = renderHook(() => useMarkAsRead(), { wrapper: createWrapper() });

            await act(async () => {
                result.current.mutate('notif-1');
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(notificationApi.markAsRead).toHaveBeenCalledWith('notif-1');
        });
    });

    describe('useMarkAllAsRead', () => {
        /**
         * Test 5: Mark all notifications as read
         */
        it('should mark all notifications as read', async () => {
            (notificationApi.markAllAsRead as any).mockResolvedValue({});

            const { result } = renderHook(() => useMarkAllAsRead(), { wrapper: createWrapper() });

            await act(async () => {
                result.current.mutate();
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(notificationApi.markAllAsRead).toHaveBeenCalled();
        });
    });
});
