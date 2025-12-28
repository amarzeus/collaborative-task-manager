/**
 * KanbanCard - Draggable task card for Kanban board
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import type { Task } from '../../types';

interface KanbanCardProps {
    task: Task;
    onClick?: () => void;
}

const priorityColors = {
    LOW: 'bg-slate-500',
    MEDIUM: 'bg-blue-500',
    HIGH: 'bg-orange-500',
    URGENT: 'bg-red-500',
};

export function KanbanCard({ task, onClick }: KanbanCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className={clsx(
                "bg-slate-800 rounded-lg p-3 cursor-grab active:cursor-grabbing",
                "border border-slate-700 hover:border-slate-600",
                "transition-all duration-200",
                isDragging && "opacity-50 shadow-2xl ring-2 ring-indigo-500",
                task.status === 'COMPLETED' && "opacity-60"
            )}
        >
            {/* Priority indicator */}
            <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className={clsx(
                    "font-medium text-sm line-clamp-2",
                    task.status === 'COMPLETED' ? "text-slate-400 line-through" : "text-white"
                )}>
                    {task.title}
                </h4>
                <span className={clsx(
                    "w-2 h-2 rounded-full flex-shrink-0 mt-1",
                    priorityColors[task.priority]
                )} />
            </div>

            {/* Meta info */}
            <div className="flex items-center gap-3 text-xs text-slate-400">
                {task.dueDate && (
                    <span className={clsx(
                        "flex items-center gap-1",
                        isOverdue && "text-red-400"
                    )}>
                        <Calendar className="w-3 h-3" />
                        {format(new Date(task.dueDate), 'MMM d')}
                    </span>
                )}
                {task.assignedTo && (
                    <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {task.assignedTo.name.split(' ')[0]}
                    </span>
                )}
            </div>
        </div>
    );
}
