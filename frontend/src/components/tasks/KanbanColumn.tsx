/**
 * KanbanColumn - Droppable column for Kanban board
 */

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import clsx from 'clsx';
import type { Task, Status } from '../../types';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
    status: Status;
    tasks: Task[];
    onTaskClick: (task: Task) => void;
}

const columnConfig: Record<Status, { label: string; color: string; bgColor: string }> = {
    TODO: {
        label: 'To Do',
        color: 'text-slate-400',
        bgColor: 'bg-slate-500/10',
    },
    IN_PROGRESS: {
        label: 'In Progress',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
    },
    REVIEW: {
        label: 'Review',
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
    },
    COMPLETED: {
        label: 'Completed',
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
    },
};

export function KanbanColumn({ status, tasks, onTaskClick }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({ id: status });
    const config = columnConfig[status];

    return (
        <div
            ref={setNodeRef}
            className={clsx(
                "flex flex-col min-h-[500px] rounded-xl p-3",
                "bg-slate-900/50 border border-slate-800",
                isOver && "ring-2 ring-indigo-500 bg-indigo-500/5"
            )}
        >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <span className={clsx("font-semibold", config.color)}>
                        {config.label}
                    </span>
                    <span className={clsx(
                        "text-xs px-2 py-0.5 rounded-full",
                        config.bgColor,
                        config.color
                    )}>
                        {tasks.length}
                    </span>
                </div>
            </div>

            {/* Cards Container */}
            <SortableContext
                items={tasks.map(t => t.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex-1 space-y-3 overflow-y-auto">
                    {tasks.map((task) => (
                        <KanbanCard
                            key={task.id}
                            task={task}
                            onClick={() => onTaskClick(task)}
                        />
                    ))}
                    {tasks.length === 0 && (
                        <div className="text-center py-8 text-slate-600 text-sm">
                            No tasks
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
}
