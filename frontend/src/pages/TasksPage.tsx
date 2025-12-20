/**
 * Tasks page with full CRUD operations
 */

import { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import {
    useTasks,
    useCreateTask,
    useUpdateTask,
    useDeleteTask,
} from '../hooks/useTasks';
import { useAuth } from '../hooks/useAuth';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskForm } from '../components/tasks/TaskForm';
import { TaskFiltersBar } from '../components/tasks/TaskFilters';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { TaskListSkeleton } from '../components/ui/Skeleton';
import type { Task, TaskFilters, CreateTaskInput, Status } from '../types/index';

export function TasksPage() {
    const { user } = useAuth();
    const [filters, setFilters] = useState<TaskFilters>({
        sortBy: 'createdAt',
        sortOrder: 'desc',
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const { data: tasks, isLoading } = useTasks(filters);
    const createTask = useCreateTask();
    const updateTask = useUpdateTask();
    const deleteTask = useDeleteTask();

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
                <Button
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={() => setIsModalOpen(true)}
                >
                    New Task
                </Button>
            </div>

            {/* Filters */}
            <TaskFiltersBar filters={filters} onChange={setFilters} />

            {/* Task list */}
            {isLoading ? (
                <TaskListSkeleton count={5} />
            ) : tasks?.length ? (
                <div className="grid gap-4">
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onEdit={openEditModal}
                            onDelete={openDeleteModal}
                            onStatusChange={handleStatusChange}
                            isCreator={task.creatorId === user?.id}
                        />
                    ))}
                </div>
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
