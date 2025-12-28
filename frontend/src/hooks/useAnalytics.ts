/**
 * Analytics hook for dashboard data
 * Returns fallback data if API fails to prevent dashboard crash
 * Includes real-time sync via Socket.io
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { analyticsApi, DashboardAnalytics, AnalyticsScope } from '../lib/analytics-api';
import { socketClient } from '../lib/socket';

const ANALYTICS_KEY = 'analytics';

// Fallback data
const FALLBACK_ANALYTICS: DashboardAnalytics = {
    trends: [],
    priorities: { low: 0, medium: 0, high: 0, urgent: 0 },
    productivity: { completedThisWeek: 0, avgCompletionDays: 0, totalCompleted: 0 },
    insights: [],
    efficiency: [
        { status: 'TODO', avgDays: 0 },
        { status: 'IN_PROGRESS', avgDays: 0 },
        { status: 'REVIEW', avgDays: 0 },
    ],
    heatmap: [],
};

/**
 * Hook to fetch dashboard analytics
 */
export function useAnalytics(scope: AnalyticsScope = 'personal', days: number = 7) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: [ANALYTICS_KEY, 'dashboard', scope, days],
        queryFn: async () => {
            try {
                return await analyticsApi.getDashboardData(scope, days);
            } catch (error) {
                console.warn('Analytics API error:', error);
                return FALLBACK_ANALYTICS;
            }
        },
        staleTime: 10000,
        refetchInterval: 60000, // slower refresh for deep analytics
        retry: false,
    });

    // Real-time sync
    useEffect(() => {
        const handleRefresh = () => {
            queryClient.invalidateQueries({ queryKey: [ANALYTICS_KEY] });
        };

        socketClient.onTaskCreated(handleRefresh);
        socketClient.onTaskUpdated(handleRefresh);
        socketClient.onTaskDeleted(handleRefresh);

        return () => {
            socketClient.offTaskCreated(handleRefresh);
            socketClient.offTaskUpdated(handleRefresh);
            socketClient.offTaskDeleted(handleRefresh);
        };
    }, [queryClient]);

    return {
        ...query,
        data: query.data ?? FALLBACK_ANALYTICS,
        isLoading: query.isLoading,
    };
}
