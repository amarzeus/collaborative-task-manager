import { useState, useEffect, useMemo } from 'react';
import { Check, Plus, X, ListChecks, Save } from 'lucide-react';
import { clsx } from 'clsx';
import { useUndo } from '../../hooks/useUndo';
import { useToast } from '../../providers/ToastProvider';
import { Button } from '../ui/Button';

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
    const [pendingDeletion, setPendingDeletion] = useState<string | null>(null);
    const [isDirty, setIsDirty] = useState(false);
    const { showUndo } = useToast();

    // Undo functionality for subtask deletion
    const { scheduleCommit } = useUndo<{ subtask: Subtask; originalDescription: string }>({
        timeout: 5000,
        onCommit: async ({ subtask, originalDescription }) => {
            try {
                // Permanently delete the subtask
                const lines = originalDescription.split('\n');
                lines.splice(subtask.lineIndex, 1);
                onUpdate(lines.join('\n'));
                setPendingDeletion(null);
                console.log('✅ Subtask permanently deleted:', subtask.text);
            } catch (err) {
                console.error('Failed to delete subtask:', err);
                setPendingDeletion(null);
            }
        },
    });

    useEffect(() => {
        if (!description) {
            setSubtasks([]);
            setIsDirty(false);
            return;
        }

        // Don't re-parse if we have local changes or pending deletion
        if (pendingDeletion || isDirty) {
            console.log('⏸️ Skipping subtask re-parse to preserve local changes');
            return;
        }

        const lines = description.split('\n');
        const tasks: Subtask[] = [];

        lines.forEach((line, index) => {
            const match = line.match(/^(\s*)-\s*\[([ xX])\]\s*(.*)$/);
            if (match) {
                tasks.push({
                    id: index,
                    lineIndex: index,
                    text: match[3],
                    completed: match[2].toLowerCase() === 'x',
                    originalLine: line,
                });
            }
        });

        setSubtasks(tasks);
        setIsDirty(false);
    }, [description, pendingDeletion, isDirty]);

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
        setSubtasks(prev =>
            prev.map(t =>
                t.id === subtask.id ? { ...t, completed: !t.completed } : t
            )
        );
        setIsDirty(true);
    };

    const handleCancel = () => {
        // Force re-parse from prop
        setIsDirty(false);
        // The useEffect will trigger on isDirty change and re-parse the description
    };

    const deleteSubtask = (subtask: Subtask, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent toggle when clicking delete
        if (readOnly) return;

        console.log('🗑️ Deleting subtask:', subtask.text);

        // Store original description for undo
        const originalDescription = description;

        // Mark as pending deletion
        setPendingDeletion(subtask.id.toString());

        // Optimistically remove from local state
        setSubtasks(prev => prev.filter(t => t.id !== subtask.id));
        setIsDirty(true); // Deletion is also a change

        // Show undo toast
        console.log('🍞 Showing undo toast for subtask');
        showUndo(
            `Subtask "${subtask.text.substring(0, 30)}..." deleted`,
            () => {
                // Undo: restore subtask AND original description
                console.log('↩️ Undoing subtask deletion:', subtask.text);
                setPendingDeletion(null);
                setSubtasks(prev => {
                    // Avoid duplicates
                    if (prev.some(t => t.id === subtask.id)) return prev;
                    // Restore in original position
                    return [...prev, subtask].sort((a, b) => a.lineIndex - b.lineIndex);
                });
                // Restore original description
                onUpdate(originalDescription);
                console.log('↩️ Subtask deletion undone');
            },
            5000
        );

        // Schedule permanent deletion
        console.log('⏰ Scheduling permanent subtask deletion in 5 seconds');
        scheduleCommit({ subtask, originalDescription });
    };

    const addSubtask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubtask.trim()) return;

        const taskText = newSubtask.trim();

        // Add to local state
        setSubtasks(prev => [
            ...prev,
            {
                id: Date.now(), // Unique ID
                lineIndex: -1, // New task, doesn't have a line index yet
                text: taskText,
                completed: false,
                originalLine: `- [ ] ${taskText}`
            }
        ]);

        setIsDirty(true);
        setNewSubtask('');
    };

    // Final combined handleSave for both edits and additions
    const saveAllChanges = () => {
        const resultLines = description.split('\n');

        // 1. Update existing subtasks
        subtasks.filter(st => st.lineIndex !== -1).forEach(task => {
            resultLines[task.lineIndex] = `- [${task.completed ? 'x' : ' '}] ${task.text}`;
        });

        // 2. Add new subtasks
        const newOnes = subtasks.filter(st => st.lineIndex === -1);
        if (newOnes.length > 0) {
            if (resultLines.length > 0 && resultLines[resultLines.length - 1].trim() !== '') {
                resultLines.push('');
            }
            newOnes.forEach(st => {
                resultLines.push(`- [ ] ${st.text}`);
            });
        }

        onUpdate(resultLines.join('\n'));
        setIsDirty(false);
    };

    if (subtasks.length === 0 && readOnly) {
        return null; // Don't show empty subtask section in read-only mode
    }

    return (
        <div className="space-y-4">
            {/* Header with progress and SAVE button */}
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
                <div className="flex items-center gap-2">
                    {isDirty && !readOnly && (
                        <div className="flex gap-2 animate-in fade-in slide-in-from-right-2">
                            <Button size="sm" variant="primary" onClick={saveAllChanges} leftIcon={<Save className="w-3 h-3" />}>
                                Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleCancel}>
                                Cancel
                            </Button>
                        </div>
                    )}
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
                                ? "bg-green-500/5 border-green-500/20"
                                : "bg-slate-800/50 border-slate-700/50",
                            isDirty && "border-indigo-500/30"
                        )}
                    >
                        <div className={clsx(
                            "w-5 h-5 rounded flex items-center justify-center border-2 transition-colors",
                            task.completed
                                ? "bg-green-500 border-green-500 text-white"
                                : "border-slate-600 group-hover:border-indigo-500"
                        )}>
                            {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className={clsx(
                            "flex-1 text-sm transition-all",
                            task.completed ? "text-slate-500 line-through" : "text-slate-200"
                        )}>
                            {task.text}
                        </span>
                        {!readOnly && (
                            <button
                                onClick={(e) => deleteSubtask(task, e)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-700 rounded-md text-slate-500 hover:text-red-400 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Add subtask */}
            {!readOnly && (
                <form onSubmit={addSubtask} className="flex gap-2">
                    <input
                        type="text"
                        value={newSubtask}
                        onChange={(e) => setNewSubtask(e.target.value)}
                        placeholder="Add a new subtask..."
                        className="flex-1 bg-slate-800/50 border border-slate-700/50 focus:border-indigo-500/50 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 outline-none transition-all"
                    />
                    <Button type="submit" variant="secondary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                        Add
                    </Button>
                </form>
            )}
        </div>
    );
}
