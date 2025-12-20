/**
 * Analytics hook for dashboard data
 */

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../lib/analytics-api';

const ANALYTICS_KEY = ['analytics', 'dashboard'];

/**
 * Hook to fetch dashboard analytics
 */
export function useAnalytics() {
    return useQuery({
        queryKey: ANALYTICS_KEY,
        queryFn: analyticsApi.getDashboardData,
        staleTime: 60000, // 1 minute
        refetchInterval: 300000, // Refetch every 5 minutes
    });
}
