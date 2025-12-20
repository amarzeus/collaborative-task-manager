/**
 * SOTA Dashboard - State-of-the-art task management dashboard
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    CheckCircle,
    Clock,
    AlertTriangle,
    ListTodo,
    ArrowRight,
    TrendingUp,
    BarChart3,
    Activity,
    Calendar,
} from 'lucide-react';
import {
    useTasks,
    useCreateTask,
    useUpdateTask,
    useDeleteTask,
} from '../hooks/useTasks';
import { useAuth } from '../hooks/useAuth';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { TaskForm } from '../components/tasks/TaskForm';
import { TaskCard } from '../components/tasks/TaskCard';

// New dashboard components
import { ProductivityRing } from '../components/dashboard/ProductivityRing';
import { StatsCard } from '../components/dashboard/StatsCard';
import { TrendChart } from '../components/dashboard/TrendChart';
import { PriorityDonut } from '../components/dashboard/PriorityDonut';
import { QuickActions } from '../components/dashboard/QuickActions';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { UpcomingDeadlines } from '../components/dashboard/UpcomingDeadlines';

import type {
    Task,
    CreateTaskInput,
    UpdateTaskInput,
    Status,
} from '../types/index';

export function DashboardPage() {
    const { user } = useAuth();
    const { data: tasks, isLoading } = useTasks();
    const createTask = useCreateTask();
    const updateTask = useUpdateTask();
    const deleteTask = useDeleteTask();

    const [showNewTaskModal, setShowNewTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'assigned' | 'created' | 'overdue'>('assigned');
    const [sortByDate, setSortByDate] = useState<'asc' | 'desc'>('asc');

    // Compute all dashboard stats
    const dashboardData = useMemo(() => {
        if (!tasks || !user) return null;

        const myTasks = tasks.filter((t) => t.assignedToId === user.id);
        const createdTasks = tasks.filter((t) => t.creatorId === user.id);
        const overdueTasks = tasks.filter(
            (t) => new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED'
        );
        const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');
        const inProgressTasks = myTasks.filter((t) => t.status === 'IN_PROGRESS');
        const todoTasks = myTasks.filter((t) => t.status === 'TODO');

        // Priority distribution
        const priorityData = {
            low: tasks.filter((t) => t.priority === 'LOW' && t.status !== 'COMPLETED').length,
            medium: tasks.filter((t) => t.priority === 'MEDIUM' && t.status !== 'COMPLETED').length,
            high: tasks.filter((t) => t.priority === 'HIGH' && t.status !== 'COMPLETED').length,
            urgent: tasks.filter((t) => t.priority === 'URGENT' && t.status !== 'COMPLETED').length,
        };

        // Generate mock trend data (last 7 days)
        const trendData = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return {
                date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                completed: Math.floor(Math.random() * 5) + (completedTasks.length > 0 ? 1 : 0),
                created: Math.floor(Math.random() * 4) + (tasks.length > 0 ? 1 : 0),
            };
        });

        // Sparkline data (simulated weekly data)
        const sparklineData = [2, 4, 3, 7, 5, 8, 6];

        // Sort lists by due date
        const sortFn = (a: Task, b: Task) => {
            const dateA = new Date(a.dueDate).getTime();
            const dateB = new Date(b.dueDate).getTime();
            return sortByDate === 'asc' ? dateA - dateB : dateB - dateA;
        };

        return {
            total: tasks.length,
            assigned: myTasks,
            created: createdTasks,
            overdue: overdueTasks,
            completed: completedTasks.length,
            inProgress: inProgressTasks.length,
            todo: todoTasks.length,
            priorityData,
            trendData,
            sparklineData,
            sortedLists: {
                assigned: [...myTasks].sort(sortFn),
                created: [...createdTasks].sort(sortFn),
                overdue: [...overdueTasks].sort(sortFn),
            }
        };
    }, [tasks, user, sortByDate]);

    const handleCreateTask = async (data: CreateTaskInput) => {
        await createTask.mutateAsync(data);
        setShowNewTaskModal(false);
    };

    const handleUpdateTask = async (data: UpdateTaskInput) => {
        if (!editingTask) return;
        await updateTask.mutateAsync({ id: editingTask.id, data });
        setEditingTask(null);
    };

    const handleDeleteTask = async () => {
        if (!deleteConfirm) return;
        await deleteTask.mutateAsync(deleteConfirm);
        setDeleteConfirm(null);
    };

    const handleStatusChange = async (id: string, status: Status) => {
        await updateTask.mutateAsync({ id, data: { status } });
    };

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const currentTabTasks = dashboardData?.sortedLists[activeTab] || [];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header with Quick Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white">
                        {greeting()}, {user?.name?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Here's an overview of your productivity and tasks.
                    </p>
                </div>
                <QuickActions onNewTask={() => setShowNewTaskModal(true)} />
            </div>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column - Stats & Charts */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Stats Cards Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatsCard
                            title="Total Tasks"
                            value={dashboardData?.total || 0}
                            icon={ListTodo}
                            color="indigo"
                            sparklineData={dashboardData?.sparklineData}
                        />
                        <StatsCard
                            title="In Progress"
                            value={dashboardData?.inProgress || 0}
                            icon={Clock}
                            color="blue"
                            trend={15}
                        />
                        <StatsCard
                            title="Completed"
                            value={dashboardData?.completed || 0}
                            icon={CheckCircle}
                            color="green"
                            trend={8}
                        />
                        <StatsCard
                            title="Overdue"
                            value={dashboardData?.overdue.length || 0}
                            icon={AlertTriangle}
                            color="red"
                            trend={dashboardData?.overdue.length ? -5 : 0}
                        />
                    </div>

                    {/* Personal Views Tabs */}
                    <Card className="min-h-[500px]">
                        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-0">
                            <div className="flex items-center gap-2">
                                <ListTodo className="w-5 h-5 text-indigo-400" />
                                <h2 className="font-semibold text-white">My Work</h2>
                            </div>
                            <div className="flex bg-slate-800/50 p-1 rounded-lg">
                                <button
                                    onClick={() => setActiveTab('assigned')}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'assigned'
                                        ? 'bg-indigo-500 text-white shadow-lg'
                                        : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    Assigned
                                </button>
                                <button
                                    onClick={() => setActiveTab('created')}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'created'
                                        ? 'bg-indigo-500 text-white shadow-lg'
                                        : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    Created
                                </button>
                                <button
                                    onClick={() => setActiveTab('overdue')}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'overdue'
                                        ? 'bg-indigo-500 text-white shadow-lg'
                                        : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    Overdue
                                </button>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <div className="mb-4 flex justify-end">
                                <button
                                    onClick={() => setSortByDate(prev => prev === 'asc' ? 'desc' : 'asc')}
                                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded"
                                >
                                    <Calendar className="w-3 h-3" />
                                    Sort by Due Date ({sortByDate === 'asc' ? 'Earliest' : 'Latest'})
                                </button>
                            </div>

                            {currentTabTasks.length > 0 ? (
                                <div className="space-y-3">
                                    {currentTabTasks.map(task => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            onEdit={setEditingTask}
                                            onDelete={setDeleteConfirm}
                                            onStatusChange={handleStatusChange}
                                            isCreator={task.creatorId === user?.id}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-12 h-12 mx-auto mb-3 bg-slate-800/50 rounded-full flex items-center justify-center">
                                        <ListTodo className="w-6 h-6 text-slate-600" />
                                    </div>
                                    <p className="text-slate-400">No tasks found in this view.</p>
                                </div>
                            )}
                        </CardBody>
                    </Card>

                    {/* Charts Row */}
                    <div className="grid lg:grid-cols-5 gap-6">
                        {/* Trend Chart - Takes more space */}
                        <Card className="lg:col-span-3">
                            <CardHeader className="flex flex-row items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-400" />
                                <h2 className="font-semibold text-white">Task Activity</h2>
                            </CardHeader>
                            <CardBody>
                                <TrendChart data={dashboardData?.trendData || []} />
                            </CardBody>
                        </Card>

                        {/* Priority Donut */}
                        <Card className="lg:col-span-2">
                            <CardHeader className="flex flex-row items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-purple-400" />
                                <h2 className="font-semibold text-white">By Priority</h2>
                            </CardHeader>
                            <CardBody>
                                <PriorityDonut data={dashboardData?.priorityData || { low: 0, medium: 0, high: 0, urgent: 0 }} />
                            </CardBody>
                        </Card>
                    </div>
                </div>

                {/* Right Column - Productivity & Deadlines */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Productivity Ring */}
                    <Card className="overflow-hidden">
                        <CardHeader>
                            <h2 className="font-semibold text-white text-center">
                                Your Productivity
                            </h2>
                        </CardHeader>
                        <CardBody className="flex justify-center pb-6">
                            <ProductivityRing
                                completed={dashboardData?.completed || 0}
                                total={dashboardData?.total || 1}
                            />
                        </CardBody>
                    </Card>

                    {/* Upcoming Deadlines */}
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-2">
                            <Calendar className="w-5 h-5 text-orange-400" />
                            <h2 className="font-semibold text-white">Upcoming Deadlines</h2>
                        </CardHeader>
                        <CardBody>
                            <UpcomingDeadlines tasks={tasks || []} maxItems={5} />
                        </CardBody>
                    </Card>

                    {/* New Activity Feed in Right Column for Balance */}
                    <Card className="flex-1">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-emerald-400" />
                                <h2 className="font-semibold text-white">Recent Activity</h2>
                            </div>
                            <Link
                                to="/tasks"
                                className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                            >
                                View all <ArrowRight className="w-4 h-4" />
                            </Link>
                        </CardHeader>
                        <CardBody>
                            <ActivityFeed tasks={tasks || []} maxItems={6} />
                        </CardBody>
                    </Card>

                </div>
            </div>

            {/* New Task Modal */}
            <Modal
                isOpen={showNewTaskModal}
                onClose={() => setShowNewTaskModal(false)}
                title="Create New Task"
            >
                <TaskForm
                    onSubmit={handleCreateTask}
                    onCancel={() => setShowNewTaskModal(false)}
                    isLoading={createTask.isPending}
                />
            </Modal>

            {/* Edit Task Modal */}
            <Modal
                isOpen={!!editingTask}
                onClose={() => setEditingTask(null)}
                title="Edit Task"
            >
                <TaskForm
                    task={editingTask || undefined}
                    onSubmit={handleUpdateTask}
                    onCancel={() => setEditingTask(null)}
                    isLoading={updateTask.isPending}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                title="Delete Task"
                size="sm"
            >
                <p className="text-slate-300 mb-6">
                    Are you sure you want to delete this task? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDeleteTask}
                        isLoading={deleteTask.isPending}
                    >
                        Delete
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
