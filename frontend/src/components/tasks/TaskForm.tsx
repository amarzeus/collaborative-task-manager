/**
 * Task Form component for creating/editing tasks
 */

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Button } from '../ui/Button';
import { Input, Textarea, Select } from '../ui/Input';
import { useUsers } from '../../hooks/useUsers';
import type { Task, CreateTaskInput, Priority, Status } from '../../types';

const taskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
    description: z.string().min(1, 'Description is required'),
    dueDate: z.string().min(1, 'Due date is required'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']),
    assignedToId: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
    task?: Task;
    onSubmit: (data: CreateTaskInput) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
];

const statusOptions = [
    { value: 'TODO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'REVIEW', label: 'Review' },
    { value: 'COMPLETED', label: 'Completed' },
];

export function TaskForm({ task, onSubmit, onCancel, isLoading }: TaskFormProps) {
    const { data: users } = useUsers();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<TaskFormData>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: '',
            description: '',
            dueDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            priority: 'MEDIUM',
            status: 'TODO',
            assignedToId: '',
        },
    });

    // Populate form when editing
    useEffect(() => {
        if (task) {
            reset({
                title: task.title,
                description: task.description,
                dueDate: format(new Date(task.dueDate), "yyyy-MM-dd'T'HH:mm"),
                priority: task.priority,
                status: task.status,
                assignedToId: task.assignedToId || '',
            });
        }
    }, [task, reset]);

    const handleFormSubmit = async (data: TaskFormData) => {
        await onSubmit({
            title: data.title,
            description: data.description,
            dueDate: new Date(data.dueDate).toISOString(),
            priority: data.priority as Priority,
            status: data.status as Status,
            assignedToId: data.assignedToId || null,
        });
    };

    const userOptions = [
        { value: '', label: 'Unassigned' },
        ...(users?.map((u) => ({ value: u.id, label: u.name })) || []),
    ];

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <Input
                label="Title"
                placeholder="Enter task title"
                {...register('title')}
                error={errors.title?.message}
            />

            <Textarea
                label="Description"
                placeholder="Enter task description"
                rows={3}
                {...register('description')}
                error={errors.description?.message}
            />

            <Input
                type="datetime-local"
                label="Due Date"
                {...register('dueDate')}
                error={errors.dueDate?.message}
            />

            <div className="grid grid-cols-2 gap-4">
                <Select
                    label="Priority"
                    options={priorityOptions}
                    {...register('priority')}
                    error={errors.priority?.message}
                />

                <Select
                    label="Status"
                    options={statusOptions}
                    {...register('status')}
                    error={errors.status?.message}
                />
            </div>

            <Select
                label="Assign To"
                options={userOptions}
                {...register('assignedToId')}
                error={errors.assignedToId?.message}
            />

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" isLoading={isLoading}>
                    {task ? 'Update Task' : 'Create Task'}
                </Button>
            </div>
        </form>
    );
}
