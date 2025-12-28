/**
 * Analytics API integration
 */

import { api } from './api';
import type { ApiResponse } from '../types';

export type AnalyticsScope = 'personal' | 'global';

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
    performanceScore: number;
    throughputTrend: number;
    leadTimeTrend: number;
    productivityTrend: number;
}

export interface EfficiencyMetric {
    status: string;
    avgDays: number;
}

export interface HeatmapData {
    date: string;
    count: number;
}

export interface DashboardAnalytics {
    trends: TrendData[];
    priorities: PriorityDistribution;
    productivity: ProductivityMetrics;
    insights: string[];
    efficiency: EfficiencyMetric[];
    heatmap: HeatmapData[];
}

export const analyticsApi = {
    /**
     * Get all dashboard analytics in one call
     */
    getDashboardData: async (scope: AnalyticsScope = 'personal', days: number = 7): Promise<DashboardAnalytics> => {
        const response = await api.get<ApiResponse<DashboardAnalytics>>(
            `/analytics/dashboard?scope=${scope}&days=${days}`
        );
        return response.data.data;
    },

    /**
     * Get completion trends
     */
    getTrends: async (days: number = 7, scope: AnalyticsScope = 'personal'): Promise<TrendData[]> => {
        const response = await api.get<ApiResponse<TrendData[]>>(
            `/analytics/trends?days=${days}&scope=${scope}`
        );
        return response.data.data;
    },

    /**
     * Get priority distribution
     */
    getPriorities: async (scope: AnalyticsScope = 'personal'): Promise<PriorityDistribution> => {
        const response = await api.get<ApiResponse<PriorityDistribution>>(
            `/analytics/priorities?scope=${scope}`
        );
        return response.data.data;
    },

    /**
     * Get productivity metrics
     */
    getProductivity: async (scope: AnalyticsScope = 'personal', days: number = 7): Promise<ProductivityMetrics> => {
        const response = await api.get<ApiResponse<ProductivityMetrics>>(
            `/analytics/productivity?scope=${scope}&days=${days}`
        );
        return response.data.data;
    },

    /**
     * Get efficiency metrics
     */
    getEfficiency: async (scope: AnalyticsScope = 'personal'): Promise<EfficiencyMetric[]> => {
        const response = await api.get<ApiResponse<EfficiencyMetric[]>>(
            `/analytics/efficiency?scope=${scope}`
        );
        return response.data.data;
    },

    /**
     * Get heatmap data
     */
    getHeatmap: async (scope: AnalyticsScope = 'personal'): Promise<HeatmapData[]> => {
        const response = await api.get<ApiResponse<HeatmapData[]>>(
            `/analytics/heatmap?scope=${scope}`
        );
        return response.data.data;
    },

    /**
     * Get smart insights
     */
    getInsights: async (scope: AnalyticsScope = 'personal', days: number = 7): Promise<string[]> => {
        const response = await api.get<ApiResponse<string[]>>(
            `/analytics/insights?scope=${scope}&days=${days}`
        );
        return response.data.data;
    },
};

