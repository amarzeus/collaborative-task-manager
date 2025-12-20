/**
 * SOTA Dashboard - State-of-the-art task management dashboard
 */

import { useState } from 'react';
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
    ArrowUpDown,
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
import { TaskCard } from '../components/tasks/TaskCard';

// Dashboard components
import { ProductivityRing } from '../components/dashboard/ProductivityRing';
import { StatsCard } from '../components/dashboard/StatsCard';
import { TrendChart } from '../components/dashboard/TrendChart';
import { PriorityDonut } from '../components/dashboard/PriorityDonut';
import { QuickActions } from '../components/dashboard/QuickActions';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { UpcomingDeadlines } from '../components/dashboard/UpcomingDeadlines';
import { FilterPills } from '../components/dashboard/FilterPills';
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
        <div className="space-y-6 animate-fade-in">
            {/* Header with Quick Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white">
                        {greeting()}, {user?.name?.split(' ')[0] || 'User'}! 👋
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
                            {/* Filter Pills */}
                            <div className="mb-4 pb-4 border-b border-slate-700/50">
                                <FilterPills
                                    selectedPriority={filterPriority}
                                    selectedStatus={filterStatus}
                                    onPriorityChange={setFilterPriority}
                                    onStatusChange={setFilterStatus}
                                    onClearAll={() => {
                                        setFilterPriority(undefined);
                                        setFilterStatus(undefined);
                                    }}
                                />
                            </div>

                            {/* Enhanced Sorting */}
                            <div className="mb-4 flex flex-wrap items-center gap-3">
                                <span className="text-xs font-medium text-slate-400">Sort by:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                    className="px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="dueDate">Due Date</option>
                                    <option value="priority">Priority</option>
                                    <option value="status">Status</option>
                                    <option value="title">Title</option>
                                    <option value="createdAt">Created Date</option>
                                </select>
                                <button
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700 border border-slate-700/50 text-slate-300 text-xs transition-colors"
                                >
                                    <ArrowUpDown className="w-3 h-3" />
                                    {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
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
                                <TrendChart data={analytics?.trends || []} />
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

                    {/* Smart Insights */}
                    {analytics?.insights && analytics.insights.length > 0 && (
                        <InsightsPanel insights={analytics.insights} />
                    )}

                    {/* Activity Feed in Right Column for Balance */}
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
