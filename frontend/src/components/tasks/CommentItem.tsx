/**
 * CommentItem component
 * Displays a single comment with user info and timestamp
 */

import { formatDistanceToNow } from 'date-fns';
import { User, Trash2 } from 'lucide-react';
import { Comment } from '../../types';
import { useAuth } from '../../hooks/useAuth';

interface CommentItemProps {
    comment: Comment;
    onDelete?: (id: string) => void;
}

export function CommentItem({ comment, onDelete }: CommentItemProps) {
    const { user } = useAuth();
    const isOwner = user?.id === comment.userId;

    return (
        <div className="flex gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 group animate-fade-in">
            {/* Avatar Placeholder */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <User className="w-4 h-4 text-indigo-400" />
            </div>

            <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-medium text-slate-200 truncate">
                            {comment.user?.name || 'Unknown User'}
                        </span>
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                    </div>

                    {isOwner && onDelete && (
                        <button
                            onClick={() => onDelete(comment.id)}
                            className="p-1 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Delete comment"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <p className="text-sm text-slate-300 break-words line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                    {comment.content}
                </p>
            </div>
        </div>
    );
}
