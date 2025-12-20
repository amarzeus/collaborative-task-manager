/**
 * Upcoming Deadlines - Visual timeline of upcoming due dates
 */

import { formatDistanceToNow, format, differenceInDays, differenceInHours } from 'date-fns';
import { Clock, AlertTriangle, Calendar } from 'lucide-react';
import type { Task } from '../../types';

interface UpcomingDeadlinesProps {
    tasks: Task[];
    maxItems?: number;
}

export function UpcomingDeadlines({ tasks, maxItems = 5 }: UpcomingDeadlinesProps) {
    const now = new Date();

    // Filter and sort upcoming tasks
    const upcomingTasks = tasks
        .filter((t) => t.status !== 'COMPLETED' && new Date(t.dueDate) >= now)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, maxItems);

    if (upcomingTasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Calendar className="w-10 h-10 mb-3 opacity-50" />
                <p className="text-sm">No upcoming deadlines</p>
                <p className="text-xs mt-1">You're all caught up! 🎉</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {upcomingTasks.map((task, index) => {
                const dueDate = new Date(task.dueDate);
                const daysUntil = differenceInDays(dueDate, now);
                const hoursUntil = differenceInHours(dueDate, now);

                // Determine urgency level
                let urgencyColor = 'text-slate-400';
                let urgencyBg = 'bg-slate-500/10';
                let urgencyBorder = 'border-slate-700/50';

                if (daysUntil <= 1) {
                    urgencyColor = 'text-red-400';
                    urgencyBg = 'bg-red-500/10';
                    urgencyBorder = 'border-red-500/30';
                } else if (daysUntil <= 3) {
                    urgencyColor = 'text-orange-400';
                    urgencyBg = 'bg-orange-500/10';
                    urgencyBorder = 'border-orange-500/30';
                } else if (daysUntil <= 7) {
                    urgencyColor = 'text-yellow-400';
                    urgencyBg = 'bg-yellow-500/10';
                    urgencyBorder = 'border-yellow-500/30';
                }

                const getCountdown = () => {
                    if (hoursUntil < 24) {
                        return `${hoursUntil}h left`;
                    } else if (daysUntil === 1) {
                        return 'Tomorrow';
                    } else {
                        return `${daysUntil}d left`;
                    }
                };

                return (
                    <div
                        key={task.id}
                        className={`
                            relative flex items-center gap-3 p-3 rounded-xl
                            ${urgencyBg} border ${urgencyBorder}
                            transition-all duration-200 hover:scale-[1.02]
                            animate-fade-in
                        `}
                        style={{ animationDelay: `${index * 75}ms` }}
                    >
                        {/* Timeline dot */}
                        <div className={`w-2 h-2 rounded-full ${urgencyColor.replace('text-', 'bg-')}`} />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-white text-sm truncate">
                                {task.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <Clock className={`w-3 h-3 ${urgencyColor}`} />
                                <span className="text-xs text-slate-400">
                                    {format(dueDate, 'MMM d, h:mm a')}
                                </span>
                            </div>
                        </div>

                        {/* Countdown badge */}
                        <div className={`
                            px-2.5 py-1 rounded-lg text-xs font-medium
                            ${urgencyColor} ${urgencyBg}
                            flex items-center gap-1
                        `}>
                            {daysUntil <= 1 && <AlertTriangle className="w-3 h-3" />}
                            {getCountdown()}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
