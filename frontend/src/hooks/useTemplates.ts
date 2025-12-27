/**
 * Custom hooks for template operations with React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateApi, CreateTemplateInput, TaskTemplate } from '../lib/api';

const TEMPLATES_QUERY_KEY = ['templates'];

/**
 * Hook to fetch all templates
 */
export function useTemplates() {
    return useQuery({
        queryKey: TEMPLATES_QUERY_KEY,
        queryFn: () => templateApi.getAll(),
        staleTime: 60000, // 1 minute
    });
}

/**
 * Hook to create a new template
 */
export function useCreateTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTemplateInput) => templateApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TEMPLATES_QUERY_KEY });
        },
    });
}

/**
 * Hook to delete a template
 */
export function useDeleteTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => templateApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TEMPLATES_QUERY_KEY });
        },
    });
}

/**
 * Hook to update a template
 */
export function useUpdateTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateTemplateInput> }) =>
            templateApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TEMPLATES_QUERY_KEY });
        },
    });
}

export type { TaskTemplate, CreateTemplateInput };
