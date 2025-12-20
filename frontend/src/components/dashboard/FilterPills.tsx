/**
 * FilterPills Component - Inline filtering for dashboard views
 * Provides quick toggle filters for Priority and Status
 */

import { X } from 'lucide-react';
import type { Priority, Status } from '../../types/index';

interface FilterPillsProps {
    selectedPriority?: Priority;
    selectedStatus?: Status;
    onPriorityChange: (priority?: Priority) => void;
    onStatusChange: (status?: Status) => void;
    onClearAll: () => void;
}

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
    { value: 'LOW', label: 'Low', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30 hover:bg-slate-500/30' },
    { value: 'MEDIUM', label: 'Medium', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30' },
    { value: 'HIGH', label: 'High', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30 hover:bg-orange-500/30' },
    { value: 'URGENT', label: 'Urgent', color: 'bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30' },
];

const STATUSES: { value: Status; label: string; color: string }[] = [
    { value: 'TODO', label: 'To Do', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30 hover:bg-slate-500/30' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30' },
    { value: 'REVIEW', label: 'Review', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30' },
    { value: 'COMPLETED', label: 'Completed', color: 'bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30' },
];

export function FilterPills({
    selectedPriority,
    selectedStatus,
    onPriorityChange,
    onStatusChange,
    onClearAll,
}: FilterPillsProps) {
    const hasActiveFilters = selectedPriority || selectedStatus;

    return (
        <div className="space-y-3">
            {/* Priority Filters */}
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Priority:
                </span>
                <div className="flex flex-wrap gap-2">
                    {PRIORITIES.map((priority) => {
                        const isActive = selectedPriority === priority.value;
                        return (
                            <button
                                key={priority.value}
                                onClick={() => onPriorityChange(isActive ? undefined : priority.value)}
                                className={`
                                    px-3 py-1.5 rounded-lg border text-xs font-medium
                                    transition-all duration-200
                                    ${isActive
                                        ? priority.color.replace('/20', '/30').replace('hover:bg-', 'bg-') + ' ring-2 ring-offset-2 ring-offset-slate-900'
                                        : priority.color
                                    }
                                `}
                            >
                                {priority.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Status:
                </span>
                <div className="flex flex-wrap gap-2">
                    {STATUSES.map((status) => {
                        const isActive = selectedStatus === status.value;
                        return (
                            <button
                                key={status.value}
                                onClick={() => onStatusChange(isActive ? undefined : status.value)}
                                className={`
                                    px-3 py-1.5 rounded-lg border text-xs font-medium
                                    transition-all duration-200
                                    ${isActive
                                        ? status.color.replace('/20', '/30').replace('hover:bg-', 'bg-') + ' ring-2 ring-offset-2 ring-offset-slate-900'
                                        : status.color
                                    }
                                `}
                            >
                                {status.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Clear All Button */}
            {hasActiveFilters && (
                <div className="flex justify-end">
                    <button
                        onClick={onClearAll}
                        className="
                            flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                            bg-slate-700/50 hover:bg-slate-700
                            text-slate-300 text-xs font-medium
                            border border-slate-600/50
                            transition-all duration-200
                        "
                    >
                        <X className="w-3 h-3" />
                        Clear all filters
                    </button>
                </div>
            )}
        </div>
    );
}
