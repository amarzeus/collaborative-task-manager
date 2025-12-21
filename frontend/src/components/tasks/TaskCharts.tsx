import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { format, differenceInDays, differenceInHours, isPast } from 'date-fns';
import { Clock, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import type { Task } from '../../types';

interface TaskChartsProps {
    task: Task;
    subtaskStats: {
        total: number;
        completed: number;
    };
}

export function TaskCharts({ task, subtaskStats }: TaskChartsProps) {
    // 1. Subtask Data
    const subtaskData = useMemo(() => [
        { name: 'Completed', value: subtaskStats.completed, color: '#4ade80' }, // green-400
        { name: 'Remaining', value: subtaskStats.total - subtaskStats.completed, color: '#334155' }, // slate-700
    ], [subtaskStats]);

    // 2. Timeline Data
    const timelineData = useMemo(() => {
        const start = new Date(task.createdAt);
        const end = new Date(task.dueDate);
        const now = new Date();
        const totalDuration = end.getTime() - start.getTime();
        const elapsed = now.getTime() - start.getTime();

        let progress = 0;
        if (totalDuration > 0) {
            progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
        }

        const daysLeft = differenceInDays(end, now);
        const hoursLeft = differenceInHours(end, now);
        const isOverdue = isPast(end) && task.status !== 'COMPLETED';

        return { progress, daysLeft, hoursLeft, isOverdue, start, end };
    }, [task.createdAt, task.dueDate, task.status]);

    if (subtaskStats.total === 0) {
        return (
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col items-center justify-center min-h-[200px] text-slate-500">
                <p>Add subtasks to see progress charts.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subtask Progress Card */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col items-center relative overflow-hidden">
                <h3 className="text-sm font-semibold text-slate-400 self-start mb-2 uppercase tracking-wider">Subtask Progress</h3>

                <div className="relative w-40 h-40">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={subtaskData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                startAngle={90}
                                endAngle={-270}
                                dataKey="value"
                                stroke="none"
                            >
                                {subtaskData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-bold text-white">{Math.round((subtaskStats.completed / subtaskStats.total) * 100)}%</span>
                        <span className="text-xs text-slate-400">Complete</span>
                    </div>
                </div>
            </div>

            {/* Timeline Efficiency Card */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Time Efficiency</h3>

                <div className="space-y-6">
                    {/* Time Status */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={clsx("p-2 rounded-lg", timelineData.isOverdue ? "bg-red-500/10 text-red-400" : "bg-indigo-500/10 text-indigo-400")}>
                                {timelineData.isOverdue ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Status</p>
                                <p className={clsx("font-medium", timelineData.isOverdue ? "text-red-400" : "text-white")}>
                                    {timelineData.isOverdue
                                        ? `Overdue by ${Math.abs(timelineData.daysLeft)} days`
                                        : `${timelineData.daysLeft} days remaining`
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>Started {format(timelineData.start, 'MMM d')}</span>
                            <span>Due {format(timelineData.end, 'MMM d')}</span>
                        </div>
                        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden relative">
                            {/* Elapsed Time Bar */}
                            <div
                                className={clsx("h-full transition-all duration-1000",
                                    timelineData.isOverdue ? "bg-red-500" : "bg-indigo-500"
                                )}
                                style={{ width: `${timelineData.progress}%` }}
                            />
                        </div>
                        <p className="text-xs text-center text-slate-500 pt-1">
                            {Math.round(timelineData.progress)}% of time elapsed
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
