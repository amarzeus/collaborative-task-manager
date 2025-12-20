/**
 * Custom hooks for notification operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback, useState } from 'react';
import { notificationApi } from '../lib/api';
import { socketClient } from '../lib/socket';
import type { Notification } from '../types/index';

const NOTIFICATIONS_KEY = ['notifications'];

/**
 * Hook to manage notifications
 */
export function useNotifications() {
    const queryClient = useQueryClient();
    const [toasts, setToasts] = useState<Partial<Notification>[]>([]);

    const query = useQuery({
        queryKey: NOTIFICATIONS_KEY,
        queryFn: notificationApi.getAll,
        staleTime: 60000, // 1 minute
    });

    // Listen for real-time notifications
    useEffect(() => {
        const handleNewNotification = (notification: Partial<Notification>) => {
            // Add to toasts for immediate display
            setToasts((prev) => [...prev, notification]);

            // Remove toast after 5 seconds
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t !== notification));
            }, 5000);

            // Invalidate notifications query
            queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
        };

        socketClient.onNotification(handleNewNotification);

        return () => {
            socketClient.offNotification(handleNewNotification);
        };
    }, [queryClient]);

    const removeToast = useCallback((index: number) => {
        setToasts((prev) => prev.filter((_, i) => i !== index));
    }, []);

    return {
        ...query,
        toasts,
        removeToast,
    };
}

/**
 * Hook to mark notification as read
 */
export function useMarkAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => notificationApi.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
        },
    });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => notificationApi.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
        },
    });
}
