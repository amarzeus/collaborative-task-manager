
import { format, isPast, isToday } from 'date-fns';
import { Circle, Clock, CheckCircle, RotateCcw, AlertTriangle } from 'lucide-react';
import { Task, Priority, Status } from '../../types';
import clsx from 'clsx';

interface MiniTaskRowProps {
    task: Task;
    onClick?: () => void;
}

const statusConfig: Record<Status, { icon: typeof Circle; color: string }> = {
    TODO: { icon: Circle, color: 'text-slate-400' },
    IN_PROGRESS: { icon: Clock, color: 'text-blue-400' },
    REVIEW: { icon: RotateCcw, color: 'text-purple-400' },
    COMPLETED: { icon: CheckCircle, color: 'text-green-400' },
};

const priorityColors: Record<Priority, string> = {
    LOW: 'bg-green-500',
    MEDIUM: 'bg-yellow-500',
    HIGH: 'bg-orange-500',
    URGENT: 'bg-red-500',
};

export function MiniTaskRow({ task, onClick }: MiniTaskRowProps) {
    const StatusIcon = statusConfig[task.status].icon;
    const dueDate = new Date(task.dueDate);
    const isOverdue = isPast(dueDate) && task.status !== 'COMPLETED';
    const isDueToday = isToday(dueDate);

    return (
        <div
            onClick={onClick}
            className="flex items-center justify-between p-2 hover:bg-slate-800/40 rounded-lg cursor-pointer transition-colors group border border-transparent hover:border-slate-700/50"
        >
            <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
                {/* Priority Indicator */}
                <div
                    className={clsx("w-1.5 h-1.5 rounded-full flex-shrink-0", priorityColors[task.priority])}
                    title={`${task.priority} Priority`}
                />

                {/* Title */}
                <span className={clsx(
                    "text-sm truncate font-medium transition-colors",
                    task.status === 'COMPLETED' ? "text-slate-500 line-through" : "text-slate-300 group-hover:text-white"
                )}>
                    {task.title}
                </span>

                {/* Overdue Warning */}
                {isOverdue && (
                    <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />
                )}
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
                {/* Due Date */}
                <span className={clsx(
                    "text-xs",
                    isOverdue ? "text-red-400 font-medium" :
                        isDueToday ? "text-yellow-400" : "text-slate-500"
                )}>
                    {format(dueDate, 'MMM d')}
                </span>

                {/* Status Icon */}
                <StatusIcon className={clsx("w-3.5 h-3.5", statusConfig[task.status].color)} />
            </div>
        </div>
    );
}
