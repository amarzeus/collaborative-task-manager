import { useState, useEffect, useMemo } from 'react';
import { CheckSquare, Square, X, ListChecks } from 'lucide-react';
import clsx from 'clsx';

interface SubtaskListProps {
    description: string;
    onUpdate: (newDescription: string) => void;
    readOnly?: boolean;
}

interface Subtask {
    id: number; // Index in the matches array or parsing order
    text: string;
    completed: boolean;
    originalLine: string;
    lineIndex: number;
}

// Helper to parse subtasks from description - exported for use in TaskCard
export function parseSubtasks(description: string): { completed: number; total: number } {
    if (!description) return { completed: 0, total: 0 };

    const lines = description.split('\n');
    let completed = 0;
    let total = 0;

    lines.forEach((line) => {
        const match = line.match(/^(\s*)-\s\[([ xX])\]\s(.*)$/);
        if (match) {
            total++;
            if (match[2].toLowerCase() === 'x') {
                completed++;
            }
        }
    });

    return { completed, total };
}

export function SubtaskList({ description, onUpdate, readOnly = false }: SubtaskListProps) {
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);

    useEffect(() => {
        if (!description) {
            setSubtasks([]);
            return;
        }

        const lines = description.split('\n');
        const tasks: Subtask[] = [];

        lines.forEach((line, index) => {
            const match = line.match(/^(\s*)-\s\[([ xX])\]\s(.*)$/);
            if (match) {
                tasks.push({
                    id: index,
                    lineIndex: index,
                    completed: match[2].toLowerCase() === 'x',
                    text: match[3].trim(),
                    originalLine: line
                });
            }
        });

        setSubtasks(tasks);
    }, [description]);

    const [newSubtask, setNewSubtask] = useState('');

    // Calculate progress stats
    const progress = useMemo(() => {
        const completed = subtasks.filter(t => t.completed).length;
        const total = subtasks.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { completed, total, percentage };
    }, [subtasks]);

    const toggleSubtask = (subtask: Subtask) => {
        if (readOnly) return;

        // Optimistic Update
        const newStatus = !subtask.completed;
        const checkMark = newStatus ? 'x' : ' ';

        // Update local state immediately
        setSubtasks(prev => prev.map(t =>
            t.id === subtask.id ? { ...t, completed: newStatus } : t
        ));

        // Update Backend
        const lines = description.split('\n');
        const line = lines[subtask.lineIndex];
        // Ensure we replace only the checkbox part to preserve text
        lines[subtask.lineIndex] = line.replace(/\[([ xX])\]/, `[${checkMark}]`);
        onUpdate(lines.join('\n'));
    };

    const deleteSubtask = (subtask: Subtask, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent toggle when clicking delete
        if (readOnly) return;

        // Optimistic update - remove from local state
        setSubtasks(prev => prev.filter(t => t.id !== subtask.id));

        // Update Backend - remove the line
        const lines = description.split('\n');
        lines.splice(subtask.lineIndex, 1);
        onUpdate(lines.join('\n'));
    };

    const addSubtask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubtask.trim()) return;

        const taskText = newSubtask.trim();

        // Optimistic Update - Add to local list temporarily (will be overwritten by prop update)
        setSubtasks(prev => [
            ...prev,
            {
                id: prev.length + 1000, // Temp ID
                lineIndex: -1, // Not needed for display
                text: taskText,
                completed: false,
                originalLine: `- [ ] ${taskText}`
            }
        ]);

        // Backend Update
        const lines = description ? description.split('\n') : [];
        if (lines.length > 0 && lines[lines.length - 1].trim() !== '') {
            lines.push('');
        }
        lines.push(`- [ ] ${taskText}`);

        onUpdate(lines.join('\n'));
        setNewSubtask('');
    };

    if (subtasks.length === 0 && readOnly) {
        return null; // Don't show empty subtask section in read-only mode
    }

    return (
        <div className="space-y-4">
            {/* Header with progress */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                        Subtasks
                    </h3>
                    <span className="text-sm text-slate-500">
                        ({progress.completed}/{progress.total})
                    </span>
                </div>
                {progress.total > 0 && (
                    <span className={clsx(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        progress.percentage === 100
                            ? "bg-green-500/20 text-green-400"
                            : progress.percentage >= 50
                                ? "bg-indigo-500/20 text-indigo-400"
                                : "bg-slate-700 text-slate-400"
                    )}>
                        {progress.percentage}%
                    </span>
                )}
            </div>

            {/* Progress bar */}
            {progress.total > 0 && (
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className={clsx(
                            "h-full transition-all duration-300 ease-out rounded-full",
                            progress.percentage === 100
                                ? "bg-green-500"
                                : "bg-indigo-500"
                        )}
                        style={{ width: `${progress.percentage}%` }}
                    />
                </div>
            )}

            {/* Subtask list */}
            <div className="space-y-2">
                {subtasks.map((task) => (
                    <div
                        key={task.id}
                        onClick={() => toggleSubtask(task)}
                        className={clsx(
                            "flex items-center gap-3 p-3 rounded-lg border transition-all group",
                            readOnly ? "cursor-default" : "cursor-pointer hover:bg-slate-800/50",
                            task.completed
                                ? "bg-slate-800/30 border-slate-800"
                                : "bg-slate-900/30 border-slate-800 hover:border-slate-700"
                        )}
                    >
                        <div className={clsx(
                            "flex-shrink-0 transition-colors",
                            task.completed ? "text-green-400" : "text-slate-500 group-hover:text-slate-400"
                        )}>
                            {task.completed ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                        </div>
                        <span className={clsx(
                            "flex-1 text-sm leading-relaxed transition-all",
                            task.completed ? "text-slate-500 line-through" : "text-slate-200"
                        )}>
                            {task.text}
                        </span>
                        {/* Delete button */}
                        {!readOnly && (
                            <button
                                onClick={(e) => deleteSubtask(task, e)}
                                className="flex-shrink-0 p-1 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-all"
                                title="Delete subtask"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Add subtask form */}
            {!readOnly && (
                <form onSubmit={addSubtask} className="relative mt-2">
                    <input
                        type="text"
                        value={newSubtask}
                        onChange={(e) => setNewSubtask(e.target.value)}
                        placeholder="Add a subtask..."
                        className="w-full bg-slate-900/30 border border-slate-700 rounded-lg py-2.5 px-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500 pointer-events-none">
                        Press Enter
                    </div>
                </form>
            )}
        </div>
    );
}
