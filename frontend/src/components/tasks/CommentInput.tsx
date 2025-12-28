/**
 * CommentInput component
 * Textarea and submit button for adding new comments
 */

import { useState, useRef } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../ui/Button';

interface CommentInputProps {
    onSubmit: (content: string) => Promise<void>;
    isLoading?: boolean;
    placeholder?: string;
}

export function CommentInput({ onSubmit, isLoading, placeholder = "Write a comment..." }: CommentInputProps) {
    const [content, setContent] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || isLoading) return;

        try {
            await onSubmit(content.trim());
            setContent('');
            // Reset height
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        } catch (error) {
            console.error('Failed to submit comment:', error);
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const target = e.target;
        setContent(target.value);

        // Auto-expand
        target.style.height = 'auto';
        target.style.height = `${target.scrollHeight}px`;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Submit on Enter (without Shift)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <div className="relative group">
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    rows={1}
                    className="w-full bg-slate-900/50 border border-slate-700/50 focus:border-indigo-500/50 rounded-lg py-3 px-4 text-sm text-slate-200 placeholder:text-slate-500 outline-none transition-all resize-none overflow-hidden min-h-[48px] max-h-[300px]"
                    disabled={isLoading}
                />

                <div className="flex justify-end mt-2">
                    <Button
                        type="submit"
                        size="sm"
                        disabled={!content.trim() || isLoading}
                        isLoading={isLoading}
                        leftIcon={!isLoading && <Send className="w-4 h-4" />}
                    >
                        Comment
                    </Button>
                </div>
            </div>
        </form>
    );
}
