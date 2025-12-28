/**
 * KanbanBoard - Main Kanban board with drag-and-drop
 */

import { useState, useMemo } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
} from '@dnd-kit/core';
import { useNavigate } from 'react-router-dom';
import type { Task, Status } from '../../types';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';

interface KanbanBoardProps {
    tasks: Task[];
    onStatusChange: (taskId: string, status: Status) => Promise<void>;
}

const STATUSES: Status[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'];

export function KanbanBoard({ tasks, onStatusChange }: KanbanBoardProps) {
    const navigate = useNavigate();
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    // Group tasks by status
    const tasksByStatus = useMemo(() => {
        const grouped: Record<Status, Task[]> = {
            TODO: [],
            IN_PROGRESS: [],
            REVIEW: [],
            COMPLETED: [],
        };
        tasks.forEach((task) => {
            grouped[task.status].push(task);
        });
        return grouped;
    }, [tasks]);

    // Configure sensors for drag detection
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Minimum drag distance before activating
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const task = tasks.find((t) => t.id === active.id);
        if (task) {
            setActiveTask(task);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const taskId = active.id as string;
        const newStatus = over.id as Status;

        // Check if dropped on a valid column
        if (!STATUSES.includes(newStatus)) return;

        // Find the task and check if status changed
        const task = tasks.find((t) => t.id === taskId);
        if (!task || task.status === newStatus) return;

        // Update task status
        await onStatusChange(taskId, newStatus);
    };

    const handleTaskClick = (task: Task) => {
        navigate(`/tasks/${task.id}`);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {STATUSES.map((status) => (
                    <KanbanColumn
                        key={status}
                        status={status}
                        tasks={tasksByStatus[status]}
                        onTaskClick={handleTaskClick}
                    />
                ))}
            </div>

            {/* Drag Overlay - Shows the card being dragged */}
            <DragOverlay>
                {activeTask ? (
                    <div className="opacity-90 rotate-3 scale-105">
                        <KanbanCard task={activeTask} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
