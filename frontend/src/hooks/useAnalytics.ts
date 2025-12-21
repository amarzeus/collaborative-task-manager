/**
 * Analytics hook for dashboard data
 * Returns fallback data if API fails to prevent dashboard crash
 * Includes real-time sync via Socket.io
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { analyticsApi, DashboardAnalytics } from '../lib/analytics-api';
import { socketClient } from '../lib/socket';

const ANALYTICS_KEY = ['analytics', 'dashboard'];

// Fallback data when analytics API is unavailable
const FALLBACK_ANALYTICS: DashboardAnalytics = {
    trends: [
        { date: 'Mon', completed: 0, created: 0 },
        { date: 'Tue', completed: 0, created: 0 },
        { date: 'Wed', completed: 0, created: 0 },
        { date: 'Thu', completed: 0, created: 0 },
        { date: 'Fri', completed: 0, created: 0 },
        { date: 'Sat', completed: 0, created: 0 },
        { date: 'Sun', completed: 0, created: 0 },
    ],
    priorities: { low: 0, medium: 0, high: 0, urgent: 0 },
    productivity: { completedThisWeek: 0, avgCompletionDays: 0, totalCompleted: 0 },
    insights: [],
};

// Safe fetch function that returns fallback on error
async function safeFetchAnalytics(): Promise<DashboardAnalytics> {
    try {
        return await analyticsApi.getDashboardData();
    } catch (error) {
        console.warn('Analytics API unavailable, using fallback data');
        return FALLBACK_ANALYTICS;
    }
}

/**
 * Hook to fetch dashboard analytics
 * Gracefully handles API failures with fallback data
 * Syncs in real-time via Socket.io task events
 */
export function useAnalytics() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ANALYTICS_KEY,
        queryFn: safeFetchAnalytics,
        staleTime: 10000, // 10 seconds - more responsive
        refetchInterval: 30000, // Refetch every 30 seconds for real-time feel
        retry: false, // Don't retry - use fallback immediately
    });

    // Real-time sync: invalidate analytics when tasks change
    useEffect(() => {
        const handleTaskChange = () => {
            // Invalidate to trigger refetch
            queryClient.invalidateQueries({ queryKey: ANALYTICS_KEY });
        };

        socketClient.onTaskCreated(handleTaskChange);
        socketClient.onTaskUpdated(handleTaskChange);
        socketClient.onTaskDeleted(handleTaskChange);

        return () => {
            socketClient.offTaskCreated(handleTaskChange);
            socketClient.offTaskUpdated(handleTaskChange);
            socketClient.offTaskDeleted(handleTaskChange);
        };
    }, [queryClient]);

    // Always return data (either real or fallback)
    return {
        ...query,
        data: query.data ?? FALLBACK_ANALYTICS,
        isLoading: query.isLoading,
    };
}
