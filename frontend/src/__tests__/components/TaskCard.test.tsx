/**
 * Unit tests for TaskCard component
 * Tests task display, actions, and status handling
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from '../../components/tasks/TaskCard';
import type { Task } from '../../types';

// Mock task data
const createMockTask = (overrides: Partial<Task> = {}): Task => ({
    id: 'task-1',
    title: 'Test Task',
    description: 'Test description',
    priority: 'MEDIUM',
    status: 'TODO',
    dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    creatorId: 'user-1',
    creator: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
    assignedToId: 'user-2',
    assignedTo: { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
});

describe('TaskCard Component', () => {
    const mockOnEdit = vi.fn();
    const mockOnDelete = vi.fn();
    const mockOnStatusChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    /**
     * Test 1: Renders task title and description
     */
    it('should render task title and description', () => {
        const task = createMockTask();
        render(
            <TaskCard
                task={task}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                onStatusChange={mockOnStatusChange}
                isCreator={true}
            />
        );

        expect(screen.getByText('Test Task')).toBeInTheDocument();
        expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    /**
     * Test 2: Displays priority badge with correct styling
     */
    it('should display priority badge', () => {
        const task = createMockTask({ priority: 'HIGH' });
        render(
            <TaskCard
                task={task}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                onStatusChange={mockOnStatusChange}
                isCreator={true}
            />
        );

        expect(screen.getByText('High')).toBeInTheDocument();
    });

    /**
     * Test 3: Displays status badge
     */
    it('should display status badge', () => {
        const task = createMockTask({ status: 'IN_PROGRESS' });
        render(
            <TaskCard
                task={task}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                onStatusChange={mockOnStatusChange}
                isCreator={true}
            />
        );

        expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    /**
     * Test 4: Calls onEdit when edit button clicked
     */
    it('should call onEdit when edit button is clicked', () => {
        const task = createMockTask();
        render(
            <TaskCard
                task={task}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                onStatusChange={mockOnStatusChange}
                isCreator={true}
            />
        );

        const editButton = screen.getByTitle('Edit task');
        fireEvent.click(editButton);

        expect(mockOnEdit).toHaveBeenCalledWith(task);
    });

    /**
     * Test 5: Shows delete button only for creator
     */
    it('should show delete button only for creator', () => {
        const task = createMockTask();
        const { rerender } = render(
            <TaskCard
                task={task}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                onStatusChange={mockOnStatusChange}
                isCreator={true}
            />
        );

        expect(screen.getByTitle('Delete task')).toBeInTheDocument();

        // Rerender as non-creator
        rerender(
            <TaskCard
                task={task}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                onStatusChange={mockOnStatusChange}
                isCreator={false}
            />
        );

        expect(screen.queryByTitle('Delete task')).not.toBeInTheDocument();
    });

    /**
     * Test 6: Calls onDelete when delete button clicked
     */
    it('should call onDelete when delete button is clicked', () => {
        const task = createMockTask();
        render(
            <TaskCard
                task={task}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                onStatusChange={mockOnStatusChange}
                isCreator={true}
            />
        );

        const deleteButton = screen.getByTitle('Delete task');
        fireEvent.click(deleteButton);

        expect(mockOnDelete).toHaveBeenCalledWith('task-1');
    });

    /**
     * Test 7: Displays assignee information
     */
    it('should display assignee name', () => {
        const task = createMockTask();
        render(
            <TaskCard
                task={task}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                onStatusChange={mockOnStatusChange}
                isCreator={true}
            />
        );

        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    /**
     * Test 8: Shows Unassigned when no assignee
     */
    it('should show "Unassigned" when task has no assignee', () => {
        const task = createMockTask({ assignedTo: null, assignedToId: null });
        render(
            <TaskCard
                task={task}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                onStatusChange={mockOnStatusChange}
                isCreator={true}
            />
        );

        expect(screen.getByText('Unassigned')).toBeInTheDocument();
    });

    /**
     * Test 9: Displays URGENT priority with warning icon
     */
    it('should display urgent priority badge', () => {
        const task = createMockTask({ priority: 'URGENT' });
        render(
            <TaskCard
                task={task}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                onStatusChange={mockOnStatusChange}
                isCreator={true}
            />
        );

        expect(screen.getByText('Urgent')).toBeInTheDocument();
    });

    /**
     * Test 10: Displays creator name
     */
    it('should display creator name', () => {
        const task = createMockTask();
        render(
            <TaskCard
                task={task}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                onStatusChange={mockOnStatusChange}
                isCreator={true}
            />
        );

        expect(screen.getByText('by John Doe')).toBeInTheDocument();
    });
});
