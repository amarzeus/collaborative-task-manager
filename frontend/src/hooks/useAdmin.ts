/**
 * Admin Hooks
 * React Query hooks for admin operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type AdminUserFilters } from '../lib/api';

const ADMIN_USERS_KEY = ['admin', 'users'];
const ADMIN_STATS_KEY = ['admin', 'stats'];

/**
 * Hook to fetch admin dashboard stats
 */
export function useAdminStats() {
    return useQuery({
        queryKey: ADMIN_STATS_KEY,
        queryFn: adminApi.getStats,
        staleTime: 60000, // 1 minute
    });
}

/**
 * Hook to fetch paginated users list for admin
 */
export function useAdminUsers(filters?: AdminUserFilters) {
    return useQuery({
        queryKey: [...ADMIN_USERS_KEY, filters],
        queryFn: () => adminApi.getUsers(filters),
        staleTime: 30000, // 30 seconds
    });
}

/**
 * Hook to fetch a single user by ID
 */
export function useAdminUser(id: string) {
    return useQuery({
        queryKey: ['admin', 'user', id],
        queryFn: () => adminApi.getUserById(id),
        enabled: !!id,
    });
}

/**
 * Hook to create a new user (admin)
 */
export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: adminApi.createUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
            queryClient.invalidateQueries({ queryKey: ADMIN_STATS_KEY });
        },
    });
}

/**
 * Hook to update a user (admin)
 */
export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Parameters<typeof adminApi.updateUser>[1] }) =>
            adminApi.updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
            queryClient.invalidateQueries({ queryKey: ADMIN_STATS_KEY });
        },
    });
}

/**
 * Hook to suspend a user
 */
export function useSuspendUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: adminApi.suspendUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
            queryClient.invalidateQueries({ queryKey: ADMIN_STATS_KEY });
        },
    });
}

/**
 * Hook to activate a suspended user
 */
export function useActivateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: adminApi.activateUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
            queryClient.invalidateQueries({ queryKey: ADMIN_STATS_KEY });
        },
    });
}
