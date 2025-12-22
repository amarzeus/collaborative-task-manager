
import { useState, useMemo } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { Card } from '../components/ui/Card';
import clsx from 'clsx';
import { Modal } from '../components/ui/Modal';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import type { Task } from '../types';

export function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const { data: tasks, isLoading } = useTasks();

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = useMemo(() => {
        return eachDayOfInterval({
            start: startDate,
            end: endDate,
        });
    }, [startDate, endDate]);

    const tasksByDate = useMemo(() => {
        if (!tasks) return {};
        const map: Record<string, Task[]> = {};
        tasks.forEach(task => {
            const dateStr = format(new Date(task.dueDate), 'yyyy-MM-dd');
            if (!map[dateStr]) map[dateStr] = [];
            map[dateStr].push(task);
        });
        return map;
    }, [tasks]);

    const selectedTasks = useMemo(() => {
        if (!selectedDate || !tasks) return [];
        return tasks.filter(task => isSameDay(new Date(task.dueDate), selectedDate));
    }, [selectedDate, tasks]);

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today);
    };

    if (isLoading) return <DashboardSkeleton />;

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="space-y-6 animate-fade-in h-[calc(100vh-8rem)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <CalendarIcon className="w-6 h-6 text-indigo-400" />
                        Calendar
                    </h1>
                    <p className="text-slate-400">View tasks by due date</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/50 p-1 rounded-lg">
                    <button onClick={prevMonth} className="p-1 hover:text-white text-slate-400">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="min-w-[140px] text-center font-medium text-white">
                        {format(currentDate, 'MMMM yyyy')}
                    </span>
                    <button onClick={nextMonth} className="p-1 hover:text-white text-slate-400">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    <button onClick={goToToday} className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded ml-2 hover:bg-indigo-500/30">
                        Today
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <Card className="flex-1 flex flex-col p-0 overflow-hidden">
                <div className="grid grid-cols-7 border-b border-slate-700 bg-slate-800/50">
                    {weekDays.map(day => (
                        <div key={day} className="py-2 text-center text-sm font-medium text-slate-400">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="flex-1 grid grid-cols-7 auto-rows-fr">
                    {calendarDays.map((day, dayIdx) => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                        const dayTasks = tasksByDate[dateKey] || [];
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const isTodayDate = isSameDay(day, new Date());
                        const isCurrentMonth = isSameMonth(day, monthStart);

                        return (
                            <div
                                key={day.toString()}
                                onClick={() => setSelectedDate(day)}
                                className={clsx(
                                    'min-h-[80px] border-b border-r border-slate-700/50 p-2 cursor-pointer transition-colors hover:bg-slate-700/20 flex flex-col gap-1',
                                    !isCurrentMonth && 'bg-slate-900/30 opacity-50',
                                    isSelected && 'bg-indigo-500/10 ring-1 ring-inset ring-indigo-500',
                                    dayIdx % 7 === 6 && 'border-r-0' // no border for last col
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={clsx(
                                        'text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full',
                                        isTodayDate
                                            ? 'bg-indigo-500 text-white'
                                            : isSelected
                                                ? 'text-indigo-400'
                                                : 'text-slate-400'
                                    )}>
                                        {format(day, 'd')}
                                    </span>
                                    {dayTasks.length > 0 && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-300">
                                            {dayTasks.length}
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-1 mt-1 overflow-hidden">
                                    {dayTasks.slice(0, 3).map(task => (
                                        <div
                                            key={task.id}
                                            className={clsx(
                                                "text-[10px] truncate px-1 rounded border-l-2",
                                                task.status === 'COMPLETED' ? 'text-slate-500 border-slate-500' :
                                                    task.priority === 'URGENT' ? 'text-red-300 bg-red-500/10 border-red-500' :
                                                        task.priority === 'HIGH' ? 'text-orange-300 bg-orange-500/10 border-orange-500' :
                                                            'text-indigo-300 bg-indigo-500/10 border-indigo-500'
                                            )}
                                        >
                                            {task.title}
                                        </div>
                                    ))}
                                    {dayTasks.length > 3 && (
                                        <div className="text-[10px] text-slate-500 pl-1">
                                            +{dayTasks.length - 3} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Selected Date Tasks Modal */}
            <Modal
                isOpen={!!selectedDate}
                onClose={() => setSelectedDate(null)}
                title={selectedDate ? format(selectedDate, 'EEEE, MMMM do, yyyy') : ''}
                size="lg"
            >
                <div>
                    {selectedTasks.length > 0 ? (
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            {/* Note: We are just showing read-only implementation for now or reusing simplified view.
                                 Ideally we reuse TaskCard but we need to pass handlers. 
                                 For Simplicity, we list them. 
                             */}
                            {selectedTasks.map(task => (
                                <div key={task.id} className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                                    <div className="flex justify-between">
                                        <h4 className="font-medium text-white">{task.title}</h4>
                                        <span className={clsx(
                                            "text-xs px-2 py-0.5 rounded-full border",
                                            task.status === 'COMPLETED' ? "border-green-500 text-green-400" : "border-indigo-500 text-indigo-400"
                                        )}>
                                            {task.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-400">
                            No tasks due on this date.
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
