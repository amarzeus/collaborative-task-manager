/**
 * Hook to fetch all users (for assignment dropdown)
 */

import { useQuery } from '@tanstack/react-query';
import { userApi } from '../lib/api';

export function useUsers() {
    return useQuery({
        queryKey: ['users'],
        queryFn: userApi.getAll,
        staleTime: 300000, // 5 minutes
    });
}
