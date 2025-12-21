import { useState, useEffect } from 'react';
import { CheckSquare, Square } from 'lucide-react';
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

    const addSubtask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubtask.trim()) return;

        const taskText = newSubtask.trim();

        // Optimistic Update - Add to local list temporarily (will be overwritten by prop update)
        // We need to calculate a temporary ID/index, but since parsing is index-based, 
        // appending to end is safe-ish for visual feedback.
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

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    Subtasks ({subtasks.filter(t => t.completed).length}/{subtasks.length})
                </h3>
            </div>

            <div className="space-y-2">
                {subtasks.map((task) => (
                    <div
                        key={task.id}
                        onClick={() => toggleSubtask(task)}
                        className={clsx(
                            "flex items-start gap-3 p-3 rounded-lg border transition-all group",
                            readOnly ? "cursor-default" : "cursor-pointer hover:bg-slate-800/50",
                            task.completed
                                ? "bg-slate-800/30 border-slate-800"
                                : "bg-slate-900/30 border-slate-800 hover:border-slate-700"
                        )}
                    >
                        <div className={clsx("mt-0.5 transition-colors", task.completed ? "text-green-400" : "text-slate-500 group-hover:text-slate-400")}>
                            {task.completed ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                        </div>
                        <span className={clsx(
                            "text-sm leading-relaxed transition-all",
                            task.completed ? "text-slate-500 line-through" : "text-slate-200"
                        )}>
                            {task.text}
                        </span>
                    </div>
                ))}
            </div>

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
