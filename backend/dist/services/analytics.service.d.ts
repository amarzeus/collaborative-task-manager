/**
 * Analytics Service
 * Generates insights and analytics from task history
 */
export declare const analyticsService: {
    /**
     * Get task completion trends for the last N days
     */
    getCompletionTrends(userId: string, days?: number): Promise<{
        date: string;
        completed: number;
        created: number;
    }[]>;
    /**
     * Get priority distribution of active tasks
     */
    getPriorityDistribution(userId: string): Promise<{
        low: number;
        medium: number;
        high: number;
        urgent: number;
    }>;
    /**
     * Get productivity metrics
     */
    getProductivityMetrics(userId: string): Promise<{
        completedThisWeek: number;
        avgCompletionDays: number;
        totalCompleted: number;
    }>;
    /**
     * Generate smart insights based on user data
     */
    getInsights(userId: string): Promise<string[]>;
};
//# sourceMappingURL=analytics.service.d.ts.map