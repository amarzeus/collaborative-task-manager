/**
 * Task Card component
 */

import { format, isPast, isToday } from 'date-fns';
import {
    Calendar,
    User,
    Edit2,
    Trash2,
    AlertTriangle,
    Clock,
    CheckCircle,
    Circle,
    RotateCcw,
} from 'lucide-react';
import clsx from 'clsx';
import type { Task, Priority, Status } from '../../types';
import { Card } from '../ui/Card';

interface TaskCardProps {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
    onStatusChange: (id: string, status: Status) => void;
    isCreator: boolean;
}

const priorityConfig: Record<Priority, { label: string; color: string; bg: string }> = {
    LOW: { label: 'Low', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
    MEDIUM: { label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
    HIGH: { label: 'High', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' },
    URGENT: { label: 'Urgent', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
};

const statusConfig: Record<Status, { label: string; icon: typeof Circle; color: string }> = {
    TODO: { label: 'To Do', icon: Circle, color: 'text-slate-400' },
    IN_PROGRESS: { label: 'In Progress', icon: Clock, color: 'text-blue-400' },
    REVIEW: { label: 'Review', icon: RotateCcw, color: 'text-purple-400' },
    COMPLETED: { label: 'Completed', icon: CheckCircle, color: 'text-green-400' },
};

const statusOrder: Status[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'];

export function TaskCard({ task, onEdit, onDelete, onStatusChange, isCreator }: TaskCardProps) {
    const priority = priorityConfig[task.priority];
    const status = statusConfig[task.status];
    const StatusIcon = status.icon;

    const dueDate = new Date(task.dueDate);
    const isOverdue = isPast(dueDate) && task.status !== 'COMPLETED';
    const isDueToday = isToday(dueDate);

    const currentStatusIndex = statusOrder.indexOf(task.status);
    const nextStatus = currentStatusIndex < statusOrder.length - 1 ? statusOrder[currentStatusIndex + 1] : null;

    return (
        <Card hover className="p-4 animate-fade-in">
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate mb-1">{task.title}</h3>
                    <p className="text-sm text-slate-400 line-clamp-2">{task.description}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                    <button
                        onClick={() => onEdit(task)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        title="Edit task"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    {isCreator && (
                        <button
                            onClick={() => onDelete(task.id)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete task"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Meta info */}
            <div className="mt-4 flex flex-wrap gap-2">
                {/* Priority badge */}
                <span className={clsx('inline-flex items-center px-2 py-1 text-xs rounded-full border', priority.bg, priority.color)}>
                    {task.priority === 'URGENT' && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {priority.label}
                </span>

                {/* Status badge */}
                <button
                    onClick={() => nextStatus && onStatusChange(task.id, nextStatus)}
                    disabled={!nextStatus}
                    className={clsx(
                        'inline-flex items-center px-2 py-1 text-xs rounded-full border border-slate-700 bg-slate-800',
                        status.color,
                        nextStatus && 'hover:border-indigo-500/50 cursor-pointer'
                    )}
                    title={nextStatus ? `Click to change to ${statusConfig[nextStatus].label}` : 'Task completed'}
                >
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {status.label}
                </button>

                {/* Due date */}
                <span
                    className={clsx(
                        'inline-flex items-center px-2 py-1 text-xs rounded-full border',
                        isOverdue
                            ? 'border-red-500/30 bg-red-500/10 text-red-400'
                            : isDueToday
                                ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                                : 'border-slate-700 bg-slate-800 text-slate-400'
                    )}
                >
                    <Calendar className="w-3 h-3 mr-1" />
                    {isOverdue && 'Overdue: '}
                    {format(dueDate, 'MMM d, yyyy')}
                </span>
            </div>

            {/* Assignee */}
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>
                        {task.assignedTo ? task.assignedTo.name : 'Unassigned'}
                    </span>
                </div>
                <span>by {task.creator.name}</span>
            </div>
        </Card>
    );
}
