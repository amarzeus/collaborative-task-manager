/**
 * Analytics hook for dashboard data
 * Returns fallback data if API fails to prevent dashboard crash
 */

import { useQuery } from '@tanstack/react-query';
import { analyticsApi, DashboardAnalytics } from '../lib/analytics-api';

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
 */
export function useAnalytics() {
    const query = useQuery({
        queryKey: ANALYTICS_KEY,
        queryFn: safeFetchAnalytics,
        staleTime: 60000, // 1 minute
        refetchInterval: 300000, // Refetch every 5 minutes
        retry: false, // Don't retry - use fallback immediately
    });

    // Always return data (either real or fallback)
    return {
        ...query,
        data: query.data ?? FALLBACK_ANALYTICS,
        isLoading: query.isLoading,
    };
}
