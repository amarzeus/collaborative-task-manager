import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, isPast } from 'date-fns';
import {
    ArrowLeft,
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
import { useTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { TaskForm } from '../components/tasks/TaskForm';
import { SubtaskList } from '../components/tasks/SubtaskList';
import { TaskCharts } from '../components/tasks/TaskCharts';
import { CommentList } from '../components/tasks/CommentList';
import type { Priority, Status, UpdateTaskInput } from '../types';
import { useUndo } from '../hooks/useUndo';
import { useToast } from '../providers/ToastProvider';
import { socketClient } from '../lib/socket';
import { useQueryClient } from '@tanstack/react-query';

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

export function TaskDetailsPage() {
    const { taskId } = useParams<{ taskId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Hooks
    const { data: task, isLoading, isError } = useTask(taskId || '');
    const updateTask = useUpdateTask();
    const deleteTask = useDeleteTask();
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    // Local State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const { showUndo } = useToast();

    // Undo functionality for task deletion
    const { scheduleCommit } = useUndo<{ taskId: string; taskTitle: string }>({
        timeout: 5000,
        onCommit: async ({ taskId }) => {
            try {
                await deleteTask.mutateAsync(taskId);
                console.log('✅ Task permanently deleted:', taskId);
            } catch (err) {
                console.error('Failed to delete task:', err);
            }
        },
    });

    // Calculate subtask stats (moved up to avoid hook order error)
    const subtaskStats = useMemo(() => {
        if (!task?.description) return { total: 0, completed: 0 };
        const matches = task?.description.match(/^(\s*)-\s\[([ xX])\]\s(.*)$/gm) || [];
        const total = matches.length;
        const completed = matches.filter(m => m.match(/^(\s*)-\s\[([xX])\]/)).length;
        return { total, completed };
    }, [task?.description]);

    const handleUpdate = async (data: UpdateTaskInput) => {
        if (!taskId) return;
        await updateTask.mutateAsync({ id: taskId, data });
        setIsEditModalOpen(false);
    };

    const handleDelete = () => {
        if (!taskId || !task) return;

        // Close modal immediately
        setIsDeleteModalOpen(false);

        // Navigate back to tasks page
        navigate('/tasks');

        // Show undo toast
        showUndo(
            `Task "${task.title}" deleted`,
            () => {
                console.log('↩️ Task deletion undone');
                // Navigate back to task
                navigate(`/tasks/${taskId}`);
            },
            5000
        );

        // Schedule permanent deletion
        scheduleCommit({ taskId, taskTitle: task.title });
    };

    const handleStatusChange = async (status: Status) => {
        if (!taskId) return;
        await updateTask.mutateAsync({ id: taskId, data: { status } });
    };

    // Real-time sync with Socket.io
    useEffect(() => {
        if (!taskId) return;

        const handleTaskUpdated = (updatedTask: Task) => {
            if (updatedTask.id === taskId) {
                console.log('📡 Real-time: Task updated', taskId);
                // Update the task in cache
                queryClient.setQueryData(['task', taskId], updatedTask);
                // Show notification if updated by another user
                if (updatedTask.updatedBy && updatedTask.updatedBy !== user?.id) {
                    showToast({
                        message: 'Task updated by another user',
                        type: 'info',
                        duration: 3000,
                    });
                }
            }
        };

        const handleTaskDeleted = ({ id }: { id: string }) => {
            if (id === taskId) {
                console.log('📡 Real-time: Task deleted', taskId);
                showToast({
                    message: 'This task was deleted by another user',
                    type: 'warning',
                    duration: 3000,
                });
                // Navigate away after a short delay
                setTimeout(() => navigate('/tasks'), 1000);
            }
        };

        // Subscribe to events
        socketClient.onTaskUpdated(handleTaskUpdated);
        socketClient.onTaskDeleted(handleTaskDeleted);

        // Cleanup
        return () => {
            socketClient.offTaskUpdated(handleTaskUpdated);
            socketClient.offTaskDeleted(handleTaskDeleted);
        };
    }, [taskId, queryClient, navigate, user?.id, showToast]);

    const handleDescriptionUpdate = async (newDescription: string) => {
        if (!taskId) return;
        handleUpdate({ description: newDescription });
    };

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (isError || !task) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400 space-y-4">
                <AlertTriangle className="w-12 h-12 text-red-400" />
                <h2 className="text-xl font-medium text-white">Task not found</h2>
                <Button onClick={() => navigate('/tasks')} variant="secondary">
                    Back to Tasks
                </Button>
            </div>
        );
    }

    const priority = priorityConfig[task.priority];
    const status = statusConfig[task.status];
    const StatusIcon = status.icon;
    const dueDate = new Date(task.dueDate);
    const isOverdue = isPast(dueDate) && task.status !== 'COMPLETED';
    const isCreator = user?.id === task.creatorId;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Navigation Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Main Task Completion Toggle */}
                <button
                    onClick={() => handleStatusChange(task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED')}
                    disabled={updateTask.isPending}
                    className={clsx(
                        "p-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900",
                        task.status === 'COMPLETED'
                            ? "bg-green-500 text-white hover:bg-green-600 focus:ring-green-500"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white focus:ring-indigo-500",
                        updateTask.isPending && "opacity-50 cursor-not-allowed"
                    )}
                    title={task.status === 'COMPLETED' ? "Mark as Incomplete" : "Mark as Complete"}
                >
                    {task.status === 'COMPLETED' ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                </button>

                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-semibold text-slate-200 truncate" title={task.title}>
                        {task.title}
                        {updateTask.isPending && <span className="ml-3 text-xs font-normal text-slate-500 animate-pulse">Saving...</span>}
                    </h1>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        leftIcon={<Edit2 className="w-4 h-4" />}
                        onClick={() => setIsEditModalOpen(true)}
                    >
                        Edit
                    </Button>
                    {isCreator && (
                        <Button
                            variant="danger"
                            leftIcon={<Trash2 className="w-4 h-4" />}
                            onClick={() => setIsDeleteModalOpen(true)}
                        >
                            Delete
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Charts Section */}
                    <TaskCharts task={task} subtaskStats={subtaskStats} />

                    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl p-6 shadow-xl">
                        {/* Status & Priority Header */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            <span className={clsx('inline-flex items-center px-3 py-1 text-sm rounded-full border', priority.bg, priority.color)}>
                                {task.priority === 'URGENT' && <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />}
                                {priority.label} Priority
                            </span>
                            <span className={clsx('inline-flex items-center px-3 py-1 text-sm rounded-full border border-slate-700 bg-slate-800', status.color)}>
                                <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
                                {status.label}
                            </span>
                            {isOverdue && (
                                <span className="inline-flex items-center px-3 py-1 text-sm rounded-full border border-red-500/30 bg-red-500/10 text-red-400">
                                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                                    Overdue
                                </span>
                            )}
                        </div>

                        <h2 className={clsx("text-2xl lg:text-3xl font-bold mb-4 leading-tight transition-all", task.status === 'COMPLETED' ? "text-slate-500 line-through" : "text-white")}>
                            {task.title}
                        </h2>

                        <div className="prose prose-invert max-w-none text-slate-300 mb-8">
                            {task.description ? (
                                <p className="whitespace-pre-wrap leading-relaxed">{task.description}</p>
                            ) : (
                                <p className="italic text-slate-500">No description provided.</p>
                            )}
                        </div>

                        {/* Interactive Subtasks */}
                        <div className="border-t border-slate-800 pt-6">
                            <SubtaskList
                                description={task.description || ''}
                                onUpdate={handleDescriptionUpdate}
                            />
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl p-6 shadow-xl">
                        <CommentList taskId={task.id} />
                    </div>
                </div>

                {/* Right Column: Sidebar Meta */}
                <div className="space-y-6">
                    {/* Quick Status Actions */}
                    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Move Status</h3>
                        {updateTask.isError && <p className="text-red-400 text-xs mb-2">Failed to update status</p>}
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(statusConfig).map(([key, config]) => (
                                <button
                                    key={key}
                                    onClick={() => handleStatusChange(key as Status)}
                                    disabled={task.status === key || updateTask.isPending}
                                    className={clsx(
                                        "px-3 py-2 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-2",
                                        task.status === key
                                            ? "bg-indigo-600 border-indigo-500 text-white opacity-100 ring-2 ring-indigo-500/20 cursor-default"
                                            : "border-slate-700 hover:border-slate-600 text-slate-400 hover:text-slate-200 hover:bg-slate-800",
                                        updateTask.isPending && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    {config.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg space-y-6">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Properties</h3>

                        {/* Assignee */}
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500">Assignee</label>
                            <div className="flex items-center gap-3 text-slate-200">
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                    <User className="w-4 h-4 text-indigo-400" />
                                </div>
                                <span className="font-medium">
                                    {task.assignedTo ? task.assignedTo.name : 'Unassigned'}
                                </span>
                            </div>
                        </div>

                        {/* Creator */}
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500">Reporter</label>
                            <div className="flex items-center gap-3 text-slate-200">
                                <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center">
                                    <User className="w-4 h-4 text-slate-400" />
                                </div>
                                <span className="font-medium">{task.creator.name}</span>
                            </div>
                        </div>

                        <div className="h-px bg-slate-800 my-2" />

                        {/* Dates */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-400 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> Due Date
                                </span>
                                <span className={clsx("text-sm font-medium", isOverdue ? "text-red-400" : "text-slate-200")}>
                                    {format(dueDate, 'MMM d, yyyy')}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-400 flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Created
                                </span>
                                <span className="text-sm text-slate-200">
                                    {format(new Date(task.createdAt), 'MMM d, yyyy')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Task"
                size="lg"
            >
                <TaskForm
                    task={task}
                    onSubmit={handleUpdate}
                    onCancel={() => setIsEditModalOpen(false)}
                    isLoading={updateTask.isPending}
                />
            </Modal>

            {/* Delete Confirmation */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Task"
                size="sm"
            >
                <p className="text-slate-300 mb-6">
                    Are you sure you want to delete <span className="text-white font-semibold">{task.title}</span>?
                    This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDelete}
                        isLoading={deleteTask.isPending}
                    >
                        Delete Task
                    </Button>
                </div>
            </Modal>
        </div >
    );
}

export default TaskDetailsPage;
