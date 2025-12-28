/**
 * CommentList component
 * Manages fetching and displaying comments for a task
 */

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import { Comment } from '../../types';
import { commentApi } from '../../lib/api';
import { CommentItem } from './CommentItem';
import { CommentInput } from './CommentInput';
import { socketClient } from '../../lib/socket';
import { useUndo } from '../../hooks/useUndo';
import { useToast } from '../../providers/ToastProvider';

interface CommentListProps {
    taskId: string;
}

export function CommentList({ taskId }: CommentListProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showUndo } = useToast();

    // Undo functionality for comment deletion
    const { scheduleCommit } = useUndo<string>({
        timeout: 5000,
        onCommit: async (commentId) => {
            try {
                await commentApi.delete(commentId);
                console.log('✅ Comment permanently deleted:', commentId);
            } catch (err) {
                console.error('Failed to delete comment:', err);
                // Restore comment if API call fails
                fetchComments();
            }
        },
    });

    const fetchComments = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await commentApi.getByTaskId(taskId);
            setComments(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch comments:', err);
            setError('Failed to load comments');
        } finally {
            setIsLoading(false);
        }
    }, [taskId]);

    useEffect(() => {
        fetchComments();

        // Socket.io real-time updates
        const handleNewComment = (newComment: Comment) => {
            if (newComment.taskId === taskId) {
                setComments(prev => {
                    // Avoid duplicates
                    if (prev.some(c => c.id === newComment.id)) return prev;
                    return [...prev, newComment];
                });
            }
        };

        const handleDeletedComment = ({ id, taskId: deletedTaskId }: { id: string, taskId: string }) => {
            if (deletedTaskId === taskId) {
                setComments(prev => prev.filter(c => c.id !== id));
            }
        };

        const handleUpdatedComment = (updatedComment: Comment) => {
            if (updatedComment.taskId === taskId) {
                setComments(prev => prev.map(c => c.id === updatedComment.id ? updatedComment : c));
            }
        };

        socketClient.onCommentCreated(handleNewComment);
        socketClient.onCommentDeleted(handleDeletedComment);
        socketClient.onCommentUpdated(handleUpdatedComment);

        return () => {
            socketClient.offCommentCreated(handleNewComment);
            socketClient.offCommentDeleted(handleDeletedComment);
            socketClient.offCommentUpdated(handleUpdatedComment);
        };
    }, [taskId, fetchComments]);

    const handleAddComment = async (content: string) => {
        try {
            setIsSubmitting(true);
            await commentApi.create({ content, taskId });
            // Comment will be added via socket event or manual fetch if socket fails
        } catch (err) {
            console.error('Failed to add comment:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = (id: string) => {
        // Find the comment to delete
        const commentToDelete = comments.find(c => c.id === id);
        if (!commentToDelete) {
            console.error('Comment not found:', id);
            return;
        }

        console.log('🗑️ Deleting comment:', id, commentToDelete.content.substring(0, 30));

        // Optimistically remove from UI
        setComments(prev => prev.filter(c => c.id !== id));

        // Show undo toast
        console.log('🍞 Showing undo toast for comment');
        showUndo(
            'Comment deleted',
            () => {
                // Undo: restore comment
                console.log('↩️ Undoing comment deletion:', id);
                setComments(prev => {
                    // Avoid duplicates
                    if (prev.some(c => c.id === id)) return prev;
                    // Insert back in original position
                    return [...prev, commentToDelete].sort((a, b) =>
                        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    );
                });
                console.log('↩️ Comment deletion undone');
            },
            5000
        );

        // Schedule permanent deletion
        console.log('⏰ Scheduling permanent deletion in 5 seconds');
        scheduleCommit(id);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-slate-200 font-medium pb-2 border-b border-slate-700/50">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <h3>Comments</h3>
                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                    {comments.length}
                </span>
            </div>

            {error && (
                <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
                    {error}
                </div>
            )}

            {/* Comment Input */}
            <CommentInput onSubmit={handleAddComment} isLoading={isSubmitting} />

            {/* Comments List */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <p className="text-sm">Loading comments...</p>
                    </div>
                ) : comments.length > 0 ? (
                    comments.map(comment => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            onDelete={handleDeleteComment}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-500 bg-slate-800/20 rounded-lg border border-dashed border-slate-700/50">
                        <MessageSquare className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-sm">No comments yet. Be the first to start the conversation!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
