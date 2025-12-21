/**
 * SOTA Dashboard - State-of-the-art task management dashboard
 */

import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isToday, isThisWeek } from 'date-fns';
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
import { useDashboardData } from '../hooks/useDashboardData';
import { useAnalytics } from '../hooks/useAnalytics';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { TaskForm } from '../components/tasks/TaskForm';

// Dashboard components
import { ProductivityRing } from '../components/dashboard/ProductivityRing';
import { MiniStatsCard } from '../components/dashboard/MiniStatsCard';
import { MiniTaskRow } from '../components/dashboard/MiniTaskRow';
import { TrendChart } from '../components/dashboard/TrendChart';
import { PriorityDonut } from '../components/dashboard/PriorityDonut';
import { QuickActions } from '../components/dashboard/QuickActions';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { UpcomingDeadlines } from '../components/dashboard/UpcomingDeadlines';
import { InsightsPanel } from '../components/dashboard/InsightsPanel';

import type {
    Task,
    CreateTaskInput,
    UpdateTaskInput,
    Status,
    Priority,
} from '../types/index';

export function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { data: tasks, isLoading } = useTasks();
    const { data: analytics } = useAnalytics();
    const createTask = useCreateTask();
    const updateTask = useUpdateTask();
    const deleteTask = useDeleteTask();

    const [showNewTaskModal, setShowNewTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'assigned' | 'created' | 'overdue'>('assigned');

    // Filter and sort state
    const [filterPriority, setFilterPriority] = useState<Priority | undefined>();
    const [filterStatus, setFilterStatus] = useState<Status | undefined>();
    const [sortBy, setSortBy] = useState<'dueDate' | 'title' | 'priority' | 'status' | 'createdAt'>('dueDate');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Use extracted dashboard data hook
    const { dashboardData, filteredTasks } = useDashboardData(
        tasks,
        user?.id,
        { priority: filterPriority, status: filterStatus },
        sortBy,
        sortOrder
    );

    // Calculate derived metrics for MiniStatsCards
    const derivedMetrics = useMemo(() => {
        if (!tasks) return { createdToday: 0, dueThisWeek: 0 };
        return {
            createdToday: tasks.filter(t => isToday(new Date(t.createdAt))).length,
            dueThisWeek: tasks.filter(t => isThisWeek(new Date(t.dueDate))).length
        };
    }, [tasks]);

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

    const currentTabTasks = filteredTasks[activeTab] || [];

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Header with Quick Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-white">
                        {greeting()}, {user?.name?.split(' ')[0] || 'User'}! 👋
                    </h1>
                    <p className="text-slate-400 text-sm mt-0.5">
                        Your productivity overview
                    </p>
                </div>
                <QuickActions onNewTask={() => setShowNewTaskModal(true)} />
            </div>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                {/* Left Column - Stats & Charts */}
                <div className="lg:col-span-8 space-y-4">

                    {/* Mini Stats Cards Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <MiniStatsCard
                            title="Total Tasks"
                            value={dashboardData?.total || 0}
                            icon={ListTodo}
                            color="indigo"
                            sparklineData={dashboardData?.sparklineData}
                            subtitle="All tasks in system"
                            detailData={{
                                items: [
                                    { label: 'Created Today', value: derivedMetrics.createdToday },
                                    { label: 'Due This Week', value: derivedMetrics.dueThisWeek },
                                    { label: 'High Priority', value: dashboardData?.priorityData?.high || 0 },
                                ],
                                chartData: dashboardData?.sparklineData?.map((v, i) => ({ name: `D${i + 1}`, value: v })),
                                linkUrl: '/tasks',
                                linkLabel: 'View All Tasks',
                            }}
                        />
                        <MiniStatsCard
                            title="In Progress"
                            value={dashboardData?.inProgress || 0}
                            icon={Clock}
                            color="blue"
                            trend={15}
                            subtitle="Currently active"
                            detailData={{
                                items: [
                                    { label: 'Started Today', value: 2 },
                                    { label: 'Avg Duration', value: '3 days' },
                                    { label: 'Assigned to Me', value: filteredTasks.assigned?.filter(t => t.status === 'IN_PROGRESS').length || 0 },
                                ],
                                linkUrl: '/tasks?status=IN_PROGRESS',
                                linkLabel: 'View In Progress',
                            }}
                        />
                        <MiniStatsCard
                            title="Completed"
                            value={dashboardData?.completed || 0}
                            icon={CheckCircle}
                            color="green"
                            trend={8}
                            subtitle="Tasks done"
                            detailData={{
                                items: [
                                    { label: 'This Week', value: analytics?.productivity?.completedThisWeek || 0, trend: 12 },
                                    { label: 'This Month', value: analytics?.productivity?.totalCompleted || 0 },
                                    { label: 'Avg Time', value: `${analytics?.productivity?.avgCompletionDays || 0}d` },
                                ],
                                linkUrl: '/tasks?status=COMPLETED',
                                linkLabel: 'View Completed',
                            }}
                        />
                        <MiniStatsCard
                            title="Overdue"
                            value={dashboardData?.overdue.length || 0}
                            icon={AlertTriangle}
                            color="red"
                            trend={dashboardData?.overdue.length ? -5 : 0}
                            subtitle="Past due date"
                            detailData={{
                                items: [
                                    { label: 'Critical', value: dashboardData?.overdue.filter(t => t.priority === 'URGENT').length || 0 },
                                    { label: 'High Priority', value: dashboardData?.overdue.filter(t => t.priority === 'HIGH').length || 0 },
                                    { label: 'Oldest', value: dashboardData?.overdue[0]?.title?.slice(0, 15) || 'None' },
                                ],
                                linkUrl: '/tasks?overdue=true',
                                linkLabel: 'View Overdue Tasks',
                            }}
                        />
                    </div>

                    {/* Personal Views Tabs */}
                    <Card className="min-h-[250px]">
                        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-0 py-3">
                            <div className="flex items-center gap-2">
                                <ListTodo className="w-4 h-4 text-indigo-400" />
                                <h2 className="font-semibold text-white text-sm">My Work</h2>
                            </div>
                            <div className="flex bg-slate-800/50 p-0.5 rounded-lg border border-slate-700/30">
                                <button
                                    onClick={() => setActiveTab('assigned')}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === 'assigned'
                                        ? 'bg-indigo-500 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                        }`}
                                >
                                    Assigned
                                </button>
                                <button
                                    onClick={() => setActiveTab('created')}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === 'created'
                                        ? 'bg-indigo-500 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                        }`}
                                >
                                    Created
                                </button>
                                <button
                                    onClick={() => setActiveTab('overdue')}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === 'overdue'
                                        ? 'bg-indigo-500 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                        }`}
                                >
                                    Overdue
                                </button>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-2">
                            {currentTabTasks.length > 0 ? (
                                <div className="space-y-1">
                                    {currentTabTasks.slice(0, 5).map(task => (
                                        <MiniTaskRow
                                            key={task.id}
                                            task={task}
                                            onClick={() => navigate(`/tasks/${task.id}`)}
                                        />
                                    ))}
                                    {currentTabTasks.length > 5 && (
                                        <button
                                            onClick={() => navigate('/tasks')}
                                            className="w-full text-center text-xs text-slate-500 hover:text-indigo-400 pt-2 transition-colors"
                                        >
                                            View {currentTabTasks.length - 5} more...
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-10 h-10 mx-auto mb-2 bg-slate-800/50 rounded-full flex items-center justify-center">
                                        <ListTodo className="w-5 h-5 text-slate-600" />
                                    </div>
                                    <p className="text-xs text-slate-500">No tasks found.</p>
                                </div>
                            )}
                        </CardBody>
                    </Card>

                    {/* Charts Row */}
                    <div className="grid lg:grid-cols-5 gap-4">
                        {/* Trend Chart - Takes more space */}
                        <Card className="lg:col-span-3">
                            <CardHeader className="flex flex-row items-center gap-2 py-2">
                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                                <h2 className="font-medium text-white text-sm">Task Activity</h2>
                            </CardHeader>
                            <CardBody className="pt-0 pb-3">
                                <div className="h-32">
                                    <TrendChart data={analytics?.trends || []} />
                                </div>
                            </CardBody>
                        </Card>

                        {/* Priority Donut */}
                        <Card className="lg:col-span-2">
                            <CardHeader className="flex flex-row items-center gap-2 py-2">
                                <BarChart3 className="w-4 h-4 text-purple-400" />
                                <h2 className="font-medium text-white text-sm">By Priority</h2>
                            </CardHeader>
                            <CardBody className="pt-0 pb-3">
                                <div className="h-32">
                                    <PriorityDonut data={dashboardData?.priorityData || { low: 0, medium: 0, high: 0, urgent: 0 }} />
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>

                {/* Right Column - Productivity & Deadlines */}
                <div className="lg:col-span-4 space-y-4">

                    {/* Productivity Ring */}
                    <Card className="overflow-hidden">
                        <CardHeader className="py-2">
                            <h2 className="font-medium text-white text-sm text-center">
                                Your Productivity
                            </h2>
                        </CardHeader>
                        <CardBody className="flex justify-center pb-4 pt-0">
                            <ProductivityRing
                                completed={dashboardData?.completed || 0}
                                total={dashboardData?.total || 1}
                                size={130}
                            />
                        </CardBody>
                    </Card>

                    {/* Upcoming Deadlines */}
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-2 py-2">
                            <Calendar className="w-4 h-4 text-orange-400" />
                            <h2 className="font-medium text-white text-sm">Upcoming Deadlines</h2>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <UpcomingDeadlines tasks={tasks || []} maxItems={3} />
                        </CardBody>
                    </Card>

                    {/* Smart Insights */}
                    {analytics?.insights && analytics.insights.length > 0 && (
                        <InsightsPanel insights={analytics.insights} />
                    )}

                    {/* Activity Feed in Right Column for Balance */}
                    <Card className="flex-1">
                        <CardHeader className="flex flex-row items-center justify-between py-2">
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-emerald-400" />
                                <h2 className="font-medium text-white text-sm">Recent Activity</h2>
                            </div>
                            <Link
                                to="/tasks"
                                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                            >
                                View all <ArrowRight className="w-3 h-3" />
                            </Link>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <ActivityFeed tasks={tasks || []} maxItems={4} />
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
