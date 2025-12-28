/**
 * Tasks page with full CRUD operations, bulk selection, and Kanban view
 */

import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CheckSquare, Square, CheckCheck, LayoutGrid, List } from 'lucide-react';
import {
    useTasks,
    useCreateTask,
    useUpdateTask,
    useDeleteTask,
} from '../hooks/useTasks';
import { useBulkStatusUpdate, useBulkPriorityUpdate, useBulkDelete } from '../hooks/useBulkTasks';
import { useAuth } from '../hooks/useAuth';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskForm } from '../components/tasks/TaskForm';
import { TaskFiltersBar } from '../components/tasks/TaskFilters';
import { BulkActionsToolbar } from '../components/tasks/BulkActionsToolbar';
import { KanbanBoard } from '../components/tasks/KanbanBoard';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { TaskListSkeleton } from '../components/ui/Skeleton';
import type { Task, TaskFilters, CreateTaskInput, Status, Priority } from '../types/index';
import clsx from 'clsx';

export function TasksPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [filters, setFilters] = useState<TaskFilters>({
        sortBy: 'createdAt',
        sortOrder: 'desc',
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // View mode state
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

    // Selection state (list view only)
    const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
    const [selectionMode, setSelectionMode] = useState(false);

    const { data: tasks, isLoading } = useTasks(filters);
    const createTask = useCreateTask();
    const updateTask = useUpdateTask();
    const deleteTask = useDeleteTask();

    // Bulk operations
    const bulkStatusUpdate = useBulkStatusUpdate();
    const bulkPriorityUpdate = useBulkPriorityUpdate();
    const bulkDelete = useBulkDelete();

    const isBulkLoading = bulkStatusUpdate.isPending || bulkPriorityUpdate.isPending || bulkDelete.isPending;

    // Check if user can delete selected tasks (must be creator of all)
    const canBulkDelete = useMemo(() => {
        if (!tasks || selectedTaskIds.size === 0) return false;
        return Array.from(selectedTaskIds).every(id => {
            const task = tasks.find(t => t.id === id);
            return task && task.creatorId === user?.id;
        });
    }, [tasks, selectedTaskIds, user?.id]);

    const handleCreate = useCallback(async (data: CreateTaskInput) => {
        await createTask.mutateAsync(data);
        setIsModalOpen(false);
    }, [createTask]);

    const handleUpdate = useCallback(async (data: CreateTaskInput) => {
        if (!editingTask) return;
        await updateTask.mutateAsync({ id: editingTask.id, data });
        setEditingTask(null);
    }, [editingTask, updateTask]);

    const handleDelete = useCallback(async () => {
        if (!deleteConfirm) return;
        await deleteTask.mutateAsync(deleteConfirm);
        setDeleteConfirm(null);
    }, [deleteConfirm, deleteTask]);

    const handleStatusChange = useCallback(
        async (id: string, status: Status) => {
            await updateTask.mutateAsync({ id, data: { status } });
        },
        [updateTask]
    );

    const openEditModal = useCallback((task: Task) => {
        setEditingTask(task);
    }, []);

    const openDeleteModal = useCallback((id: string) => {
        setDeleteConfirm(id);
    }, []);

    // Selection handlers
    const toggleSelection = useCallback((taskId: string) => {
        setSelectedTaskIds(prev => {
            const next = new Set(prev);
            if (next.has(taskId)) {
                next.delete(taskId);
            } else {
                next.add(taskId);
            }
            // Exit selection mode if nothing selected
            if (next.size === 0) {
                setSelectionMode(false);
            } else {
                setSelectionMode(true);
            }
            return next;
        });
    }, []);

    const selectAll = useCallback(() => {
        if (!tasks) return;
        setSelectedTaskIds(new Set(tasks.map(t => t.id)));
        setSelectionMode(true);
    }, [tasks]);

    const clearSelection = useCallback(() => {
        setSelectedTaskIds(new Set());
        setSelectionMode(false);
    }, []);

    // Bulk action handlers
    const handleBulkStatusChange = useCallback(async (status: Status) => {
        await bulkStatusUpdate.mutateAsync({
            taskIds: Array.from(selectedTaskIds),
            status,
        });
        clearSelection();
    }, [selectedTaskIds, bulkStatusUpdate, clearSelection]);

    const handleBulkPriorityChange = useCallback(async (priority: Priority) => {
        await bulkPriorityUpdate.mutateAsync({
            taskIds: Array.from(selectedTaskIds),
            priority,
        });
        clearSelection();
    }, [selectedTaskIds, bulkPriorityUpdate, clearSelection]);

    const handleBulkDelete = useCallback(async () => {
        await bulkDelete.mutateAsync(Array.from(selectedTaskIds));
        clearSelection();
    }, [selectedTaskIds, bulkDelete, clearSelection]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Tasks</h1>
                    <p className="text-slate-400 mt-1">
                        Manage and track all your tasks in one place.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* View Toggle */}
                    <div className="flex items-center bg-slate-800 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={clsx(
                                "p-2 rounded-md transition-colors",
                                viewMode === 'list'
                                    ? "bg-indigo-600 text-white"
                                    : "text-slate-400 hover:text-white"
                            )}
                            title="List view"
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={clsx(
                                "p-2 rounded-md transition-colors",
                                viewMode === 'kanban'
                                    ? "bg-indigo-600 text-white"
                                    : "text-slate-400 hover:text-white"
                            )}
                            title="Kanban view"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>

                    {viewMode === 'list' && tasks && tasks.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={selectionMode ? clearSelection : selectAll}
                            leftIcon={selectionMode ? <Square className="w-4 h-4" /> : <CheckCheck className="w-4 h-4" />}
                        >
                            {selectionMode ? 'Clear' : 'Select All'}
                        </Button>
                    )}
                    <Button
                        leftIcon={<Plus className="w-4 h-4" />}
                        onClick={() => setIsModalOpen(true)}
                    >
                        New Task
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <TaskFiltersBar filters={filters} onChange={setFilters} />

            {/* Task list or Kanban board */}
            {isLoading ? (
                <TaskListSkeleton count={5} />
            ) : tasks?.length ? (
                viewMode === 'kanban' ? (
                    <KanbanBoard
                        tasks={tasks}
                        onStatusChange={handleStatusChange}
                    />
                ) : (
                    <div className="grid gap-4">
                        {tasks.map((task) => (
                            <div key={task.id} className="flex items-start gap-3">
                                {/* Selection checkbox */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSelection(task.id);
                                    }}
                                    className={clsx(
                                        "flex-shrink-0 mt-4 p-1 rounded transition-all",
                                        selectedTaskIds.has(task.id)
                                            ? "text-indigo-400"
                                            : "text-slate-600 hover:text-slate-400"
                                    )}
                                >
                                    {selectedTaskIds.has(task.id) ? (
                                        <CheckSquare className="w-5 h-5" />
                                    ) : (
                                        <Square className="w-5 h-5" />
                                    )}
                                </button>

                                {/* Task card */}
                                <div className="flex-1">
                                    <TaskCard
                                        task={task}
                                        onEdit={openEditModal}
                                        onDelete={openDeleteModal}
                                        onStatusChange={handleStatusChange}
                                        isCreator={task.creatorId === user?.id}
                                        onClick={() => navigate(`/tasks/${task.id}`)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-800 rounded-full flex items-center justify-center">
                        <Plus className="w-8 h-8 text-slate-600" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">No tasks found</h3>
                    <p className="text-slate-400 mb-6">
                        {filters.status || filters.priority || filters.assignedToMe || filters.createdByMe || filters.overdue
                            ? 'Try adjusting your filters to find more tasks.'
                            : 'Get started by creating your first task.'}
                    </p>
                    <Button onClick={() => setIsModalOpen(true)}>
                        Create Task
                    </Button>
                </div>
            )}

            {/* Bulk Actions Toolbar (list view only) */}
            {viewMode === 'list' && selectedTaskIds.size > 0 && (
                <BulkActionsToolbar
                    selectedCount={selectedTaskIds.size}
                    onClearSelection={clearSelection}
                    onStatusChange={handleBulkStatusChange}
                    onPriorityChange={handleBulkPriorityChange}
                    onDelete={handleBulkDelete}
                    isLoading={isBulkLoading}
                    canDelete={canBulkDelete}
                />
            )}

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen || !!editingTask}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingTask(null);
                }}
                title={editingTask ? 'Edit Task' : 'Create Task'}
                size="lg"
            >
                <TaskForm
                    task={editingTask || undefined}
                    onSubmit={editingTask ? handleUpdate : handleCreate}
                    onCancel={() => {
                        setIsModalOpen(false);
                        setEditingTask(null);
                    }}
                    isLoading={createTask.isPending || updateTask.isPending}
                />
            </Modal>

            {/* Delete confirmation modal */}
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
                        onClick={handleDelete}
                        isLoading={deleteTask.isPending}
                    >
                        Delete
                    </Button>
                </div>
            </Modal>
        </div>
    );
}

