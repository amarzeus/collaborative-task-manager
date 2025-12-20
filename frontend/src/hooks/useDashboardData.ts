/**
 * useDashboardData Hook
 * Extracts dashboard statistics calculation logic from DashboardPage
 * Provides filtered and sorted task data with computed metrics
 */

import { useMemo } from 'react';
import type { Task, Priority, Status } from '../types/index';

interface DashboardFilters {
    priority?: Priority;
    status?: Status;
}

interface DashboardData {
    total: number;
    assigned: Task[];
    created: Task[];
    overdue: Task[];
    completed: number;
    inProgress: number;
    todo: number;
    priorityData: {
        low: number;
        medium: number;
        high: number;
        urgent: number;
    };
    sparklineData: number[];
}

interface UseDashboardDataReturn {
    dashboardData: DashboardData | null;
    filteredTasks: {
        assigned: Task[];
        created: Task[];
        overdue: Task[];
    };
}

export function useDashboardData(
    tasks: Task[] | undefined,
    userId: string | undefined,
    filters: DashboardFilters = {},
    sortBy: 'dueDate' | 'title' | 'priority' | 'status' | 'createdAt' = 'dueDate',
    sortOrder: 'asc' | 'desc' = 'asc'
): UseDashboardDataReturn {
    return useMemo(() => {
        if (!tasks || !userId) {
            return { dashboardData: null, filteredTasks: { assigned: [], created: [], overdue: [] } };
        }

        // Base task lists
        const myTasks = tasks.filter((t) => t.assignedToId === userId);
        const createdTasks = tasks.filter((t) => t.creatorId === userId);
        const overdueTasks = tasks.filter(
            (t) => new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED'
        );
        const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');
        const inProgressTasks = myTasks.filter((t) => t.status === 'IN_PROGRESS');
        const todoTasks = myTasks.filter((t) => t.status === 'TODO');

        // Priority distribution (active tasks only)
        const priorityData = {
            low: tasks.filter((t) => t.priority === 'LOW' && t.status !== 'COMPLETED').length,
            medium: tasks.filter((t) => t.priority === 'MEDIUM' && t.status !== 'COMPLETED').length,
            high: tasks.filter((t) => t.priority === 'HIGH' && t.status !== 'COMPLETED').length,
            urgent: tasks.filter((t) => t.priority === 'URGENT' && t.status !== 'COMPLETED').length,
        };

        // Note: Trend data should come from analytics API
        // Sparkline data (simulated weekly data) - will be replaced by real productivity data
        const sparklineData = [2, 4, 3, 7, 5, 8, 6];

        // Apply filters
        const applyFilters = (taskList: Task[]): Task[] => {
            let filtered = taskList;

            if (filters.priority) {
                filtered = filtered.filter((t) => t.priority === filters.priority);
            }

            if (filters.status) {
                filtered = filtered.filter((t) => t.status === filters.status);
            }

            return filtered;
        };

        // Sort function
        const sortTasks = (taskList: Task[]): Task[] => {
            return [...taskList].sort((a, b) => {
                let compareValue = 0;

                switch (sortBy) {
                    case 'dueDate':
                        compareValue = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                        break;
                    case 'title':
                        compareValue = a.title.localeCompare(b.title);
                        break;
                    case 'priority': {
                        const priorityOrder = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
                        compareValue = priorityOrder[a.priority] - priorityOrder[b.priority];
                        break;
                    }
                    case 'status': {
                        const statusOrder = { TODO: 1, IN_PROGRESS: 2, REVIEW: 3, COMPLETED: 4 };
                        compareValue = statusOrder[a.status] - statusOrder[b.status];
                        break;
                    }
                    case 'createdAt':
                        compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                        break;
                }

                return sortOrder === 'asc' ? compareValue : -compareValue;
            });
        };

        // Apply filters and sorting to each list
        const filteredAndSorted = {
            assigned: sortTasks(applyFilters(myTasks)),
            created: sortTasks(applyFilters(createdTasks)),
            overdue: sortTasks(applyFilters(overdueTasks)),
        };

        const dashboardData: DashboardData = {
            total: tasks.length,
            assigned: myTasks,
            created: createdTasks,
            overdue: overdueTasks,
            completed: completedTasks.length,
            inProgress: inProgressTasks.length,
            todo: todoTasks.length,
            priorityData,
            sparklineData,
        };

        return {
            dashboardData,
            filteredTasks: filteredAndSorted,
        };
    }, [tasks, userId, filters.priority, filters.status, sortBy, sortOrder]);
}
