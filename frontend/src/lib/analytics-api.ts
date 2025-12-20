/**
 * Analytics API integration
 */

import { api } from './api';
import type { ApiResponse } from '../types';

export interface TrendData {
    date: string;
    completed: number;
    created: number;
}

export interface PriorityDistribution {
    low: number;
    medium: number;
    high: number;
    urgent: number;
}

export interface ProductivityMetrics {
    completedThisWeek: number;
    avgCompletionDays: number;
    totalCompleted: number;
}

export interface DashboardAnalytics {
    trends: TrendData[];
    priorities: PriorityDistribution;
    productivity: ProductivityMetrics;
    insights: string[];
}

export const analyticsApi = {
    /**
     * Get all dashboard analytics in one call
     */
    getDashboardData: async (): Promise<DashboardAnalytics> => {
        const response = await api.get<ApiResponse<DashboardAnalytics>>('/analytics/dashboard');
        return response.data.data;
    },

    /**
     * Get completion trends
     */
    getTrends: async (days: number = 7): Promise<TrendData[]> => {
        const response = await api.get<ApiResponse<TrendData[]>>(`/analytics/trends?days=${days}`);
        return response.data.data;
    },

    /**
     * Get priority distribution
     */
    getPriorities: async (): Promise<PriorityDistribution> => {
        const response = await api.get<ApiResponse<PriorityDistribution>>('/analytics/priorities');
        return response.data.data;
    },

    /**
     * Get productivity metrics
     */
    getProductivity: async (): Promise<ProductivityMetrics> => {
        const response = await api.get<ApiResponse<ProductivityMetrics>>('/analytics/productivity');
        return response.data.data;
    },

    /**
     * Get smart insights
     */
    getInsights: async (): Promise<string[]> => {
        const response = await api.get<ApiResponse<string[]>>('/analytics/insights');
        return response.data.data;
    },
};
