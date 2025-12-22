
import { useState, useEffect } from 'react';
import { useTasks, useUpdateTask } from '../../hooks/useTasks';
import { Modal } from '../ui/Modal';
import { CheckCircle, Play, Pause, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import clsx from 'clsx';
import type { Task } from '../../types';

interface FocusModeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function FocusModeModal({ isOpen, onClose }: FocusModeModalProps) {
    const { user } = useAuth();
    const { data: tasks } = useTasks();
    const updateTask = useUpdateTask();

    // Timer state
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
    const [isActive, setIsActive] = useState(false);
    const [isBreak] = useState(false);

    // Task state
    const [focusTask, setFocusTask] = useState<Task | null>(null);

    // Get the most important task for the user
    useEffect(() => {
        if (isOpen && tasks && user) {
            // Find highest priority task assigned to user that is not completed
            const myTasks = tasks.filter(t => t.assignedToId === user.id && t.status !== 'COMPLETED');

            const sorted = myTasks.sort((a, b) => {
                // Urgent > High > Medium > Low
                const priorityWeight = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
                const pDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
                if (pDiff !== 0) return pDiff;

                // Then due date
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            });

            if (sorted.length > 0) {
                setFocusTask(sorted[0]);
            }
        }
    }, [isOpen, tasks, user]);

    // Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Play sound?
            if (!isBreak) {
                // If focus session ended, simple notification?
            }
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft, isBreak]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(isBreak ? 5 * 60 : 25 * 60);
    };

    const handleCompleteTask = async () => {
        if (focusTask) {
            await updateTask.mutateAsync({
                id: focusTask.id,
                data: { status: 'COMPLETED' }
            });
            // Show celebration or close? for now just close
            onClose();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = 100 - (timeLeft / (isBreak ? 5 * 60 : 25 * 60)) * 100;

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                if (isActive) {
                    if (confirm("Timer is running. Are you sure you want to exit focus mode?")) {
                        onClose();
                    }
                } else {
                    onClose();
                }
            }}
            title="Focus Mode 🎯"
            size="lg"
        >
            <div className="flex flex-col items-center py-6 space-y-8">
                {/* Timer Display */}
                <div className="relative w-64 h-64 flex items-center justify-center">
                    {/* Ring SVG */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="8" />
                        <circle
                            cx="50" cy="50" r="45" fill="none"
                            stroke={isBreak ? "#10b981" : "#6366f1"}
                            strokeWidth="8"
                            strokeDasharray="283"
                            strokeDashoffset={283 - (283 * progress) / 100}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-linear"
                        />
                    </svg>
                    <div className="text-center z-10">
                        <div className="text-5xl font-mono font-bold text-white tracking-widest">
                            {formatTime(timeLeft)}
                        </div>
                        <p className="text-slate-400 mt-2 font-medium">
                            {isBreak ? 'Break Time ☕' : 'Focus Time 🧠'}
                        </p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex gap-4">
                    <button
                        onClick={toggleTimer}
                        className={clsx(
                            "p-4 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center",
                            isActive ? "bg-amber-500 hover:bg-amber-600" : "bg-indigo-500 hover:bg-indigo-600"
                        )}
                    >
                        {isActive ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white ml-1" />}
                    </button>
                    <button
                        onClick={resetTimer}
                        className="p-4 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 transition-all hover:scale-105"
                    >
                        <X className="w-8 h-8" />
                    </button>
                </div>

                {/* Current Task */}
                <div className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
                    <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold mb-2">
                        Working On
                    </p>
                    {focusTask ? (
                        <>
                            <h3 className="text-xl font-bold text-white mb-2">{focusTask.title}</h3>
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <span className={clsx(
                                    "px-2 py-1 text-xs rounded-full border",
                                    focusTask.priority === 'URGENT' ? "border-red-500 text-red-500" :
                                        focusTask.priority === 'HIGH' ? "border-orange-500 text-orange-500" :
                                            "border-blue-500 text-blue-500"
                                )}>
                                    {focusTask.priority}
                                </span>
                            </div>
                            <Button
                                variant="primary"
                                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 border-green-500"
                                leftIcon={<CheckCircle className="w-4 h-4" />}
                                onClick={handleCompleteTask}
                            >
                                Complete Task
                            </Button>
                        </>
                    ) : (
                        <div className="text-slate-400 italic">
                            No active tasks assigned to you! Relax or create one.
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
