import { useState, useMemo, useEffect, useRef } from 'react';
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
    subMonths,
    isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { useTasks } from '../../hooks/useTasks';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import type { Task } from '../../types';

interface CalendarDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    className?: string; // Allow external positioning
}

export function CalendarDropdown({ isOpen, onClose, className }: CalendarDropdownProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const { data: tasks } = useTasks();
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                // Check if the click was on the trigger button is handled by parent usually, 
                // but since we don't know the trigger, we rely on parent managing state or 
                // this hook closing it. 
                // However, if the click was on the trigger, the parent might toggle it. 
                // If we close it here, and parent toggles it, it might reopen. 
                // Standard practice: Internal click outside handler invokes onClose.
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

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

    const nextMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentDate(addMonths(currentDate, 1));
    };
    const prevMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentDate(subMonths(currentDate, 1));
    };
    const goToToday = (e: React.MouseEvent) => {
        e.stopPropagation();
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today);
    };

    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    if (!isOpen) return null;

    const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
    const selectedDateTasks = tasksByDate[selectedDateStr] || [];
    const pendingTasks = selectedDateTasks.filter(t => t.status !== 'COMPLETED');

    return (
        <div
            ref={dropdownRef}
            className={clsx(
                "absolute z-50 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl animate-fade-in overflow-hidden",
                className
            )}
            style={{ right: 0 }} // Default alignment
            // stop propagation to prevent immediate close if clicked inside
            onMouseDown={(e) => e.stopPropagation()}
        >
            <div className="p-4 space-y-4">
                {/* Calendar Header */}
                <div className="flex items-center justify-between">
                    <button onClick={prevMonth} className="p-1 hover:text-white text-slate-400 hover:bg-slate-700 rounded transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="font-semibold text-white">
                        {format(currentDate, 'MMMM yyyy')}
                    </span>
                    <div className="flex items-center gap-2">
                        <button onClick={goToToday} className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded hover:bg-indigo-500/30 transition-colors">
                            Today
                        </button>
                        <button onClick={nextMonth} className="p-1 hover:text-white text-slate-400 hover:bg-slate-700 rounded transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Grid */}
                <div className="border border-slate-700/50 rounded-lg overflow-hidden bg-slate-900/20">
                    <div className="grid grid-cols-7 border-b border-slate-700/50 bg-slate-800/50">
                        {weekDays.map(day => (
                            <div key={day} className="py-2 text-center text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 auto-rows-fr">
                        {calendarDays.map((day, dayIdx) => {
                            const dateKey = format(day, 'yyyy-MM-dd');
                            const dayTasks = tasksByDate[dateKey] || [];
                            const hasPending = dayTasks.some(t => t.status !== 'COMPLETED');
                            const isSelected = selectedDate && isSameDay(day, selectedDate);
                            const isTodayDate = isToday(day);
                            const isCurrentMonth = isSameMonth(day, monthStart);

                            return (
                                <div
                                    key={day.toString()}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedDate(day);
                                    }}
                                    className={clsx(
                                        'min-h-[40px] border-b border-r border-slate-700/30 p-1 cursor-pointer transition-colors hover:bg-slate-700/30 flex flex-col items-center gap-1 relative',
                                        !isCurrentMonth && 'bg-slate-900/40 opacity-30',
                                        isSelected && 'bg-indigo-500/10 shadow-inner',
                                        dayIdx % 7 === 6 && 'border-r-0'
                                    )}
                                >
                                    <span className={clsx(
                                        'text-[10px] w-5 h-5 flex items-center justify-center rounded-full transition-all',
                                        isTodayDate
                                            ? 'bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/30'
                                            : isSelected
                                                ? 'text-indigo-400 font-semibold ring-1 ring-indigo-500/50'
                                                : 'text-slate-400'
                                    )}>
                                        {format(day, 'd')}
                                    </span>
                                    {hasPending && (
                                        <div className="flex gap-0.5">
                                            <span className={clsx(
                                                "w-1 h-1 rounded-full",
                                                dayTasks.some(t => t.priority === 'URGENT' && t.status !== 'COMPLETED') ? "bg-red-500" :
                                                    dayTasks.some(t => t.priority === 'HIGH' && t.status !== 'COMPLETED') ? "bg-orange-500" : "bg-blue-500"
                                            )} />
                                        </div>
                                    )}
                                    {isSelected && (
                                        <div className="absolute inset-0 border-2 border-indigo-500/50 rounded pointer-events-none" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Selected Date Details */}
                <div className="bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="p-3 border-b border-slate-700/50">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            {selectedDate ? format(selectedDate, 'EEEE, MMMM do') : 'Select a date'}
                        </h4>
                    </div>
                    {selectedDate && (
                        <div className="max-h-[200px] overflow-y-auto p-2 space-y-2">
                            {pendingTasks.length > 0 ? (
                                pendingTasks.map(task => (
                                    <div
                                        key={task.id}
                                        onClick={() => navigate('/tasks')}
                                        className="group flex items-center justify-between p-2 rounded-lg bg-slate-800 border border-slate-700/50 hover:bg-slate-700 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div className={clsx(
                                                "w-1.5 h-1.5 rounded-full flex-shrink-0",
                                                task.priority === 'URGENT' ? "bg-red-500" :
                                                    task.priority === 'HIGH' ? "bg-orange-500" : "bg-blue-500"
                                            )} />
                                            <span className="text-sm text-slate-200 truncate group-hover:text-white">
                                                {task.title}
                                            </span>
                                        </div>
                                        <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all" />
                                    </div>
                                ))
                            ) : (
                                <div className="py-4 text-center">
                                    <p className="text-xs text-slate-500 italic">No pending tasks</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
