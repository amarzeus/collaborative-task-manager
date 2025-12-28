import { z } from 'zod';

/**
 * DTO for creating a new comment
 */
export const CreateCommentDto = z.object({
    content: z.string().min(1, 'Comment content is required').max(1000, 'Comment too long'),
    taskId: z.string().uuid('Invalid task ID'),
});

/**
 * DTO for updating an existing comment
 */
export const UpdateCommentDto = z.object({
    content: z.string().min(1, 'Comment content is required').max(1000, 'Comment too long'),
});

export type CreateCommentInput = z.infer<typeof CreateCommentDto>;
export type UpdateCommentInput = z.infer<typeof UpdateCommentDto>;
