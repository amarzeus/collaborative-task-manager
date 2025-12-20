/**
 * Task filters component
 */

import { Filter, ArrowUpDown, X } from 'lucide-react';
import clsx from 'clsx';
import type { TaskFilters, Priority, Status } from '../../types';

interface TaskFiltersBarProps {
    filters: TaskFilters;
    onChange: (filters: TaskFilters) => void;
}

const priorities: { value: Priority | ''; label: string }[] = [
    { value: '', label: 'All Priorities' },
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
];

const statuses: { value: Status | ''; label: string }[] = [
    { value: '', label: 'All Statuses' },
    { value: 'TODO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'REVIEW', label: 'Review' },
    { value: 'COMPLETED', label: 'Completed' },
];

const sortOptions = [
    { value: 'dueDate', label: 'Due Date' },
    { value: 'createdAt', label: 'Created Date' },
    { value: 'priority', label: 'Priority' },
];

export function TaskFiltersBar({ filters, onChange }: TaskFiltersBarProps) {
    const hasActiveFilters = filters.status || filters.priority || filters.assignedToMe || filters.createdByMe || filters.overdue;

    const clearFilters = () => {
        onChange({
            sortBy: filters.sortBy,
            sortOrder: filters.sortOrder,
        });
    };

    return (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-4">
            {/* Filter row */}
            <div className="flex flex-wrap items-center gap-3">
                <Filter className="w-4 h-4 text-slate-400" />

                {/* Status filter */}
                <select
                    value={filters.status || ''}
                    onChange={(e) => onChange({ ...filters, status: (e.target.value as Status) || undefined })}
                    className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    {statuses.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>

                {/* Priority filter */}
                <select
                    value={filters.priority || ''}
                    onChange={(e) => onChange({ ...filters, priority: (e.target.value as Priority) || undefined })}
                    className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    {priorities.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                </select>

                {/* Quick filters */}
                <div className="flex gap-2">
                    <button
                        onClick={() => onChange({ ...filters, assignedToMe: !filters.assignedToMe })}
                        className={clsx(
                            'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                            filters.assignedToMe
                                ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
                                : 'bg-slate-700 border-slate-600 text-slate-400 hover:text-white'
                        )}
                    >
                        Assigned to me
                    </button>
                    <button
                        onClick={() => onChange({ ...filters, createdByMe: !filters.createdByMe })}
                        className={clsx(
                            'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                            filters.createdByMe
                                ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
                                : 'bg-slate-700 border-slate-600 text-slate-400 hover:text-white'
                        )}
                    >
                        Created by me
                    </button>
                    <button
                        onClick={() => onChange({ ...filters, overdue: !filters.overdue })}
                        className={clsx(
                            'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                            filters.overdue
                                ? 'bg-red-500/20 border-red-500/30 text-red-400'
                                : 'bg-slate-700 border-slate-600 text-slate-400 hover:text-white'
                        )}
                    >
                        Overdue
                    </button>
                </div>

                {/* Clear filters */}
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        title="Clear filters"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Sort row */}
            <div className="flex items-center gap-3">
                <ArrowUpDown className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-400">Sort by:</span>
                <select
                    value={filters.sortBy || 'createdAt'}
                    onChange={(e) => onChange({ ...filters, sortBy: e.target.value as TaskFilters['sortBy'] })}
                    className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    {sortOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
                <button
                    onClick={() => onChange({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
                    className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white hover:bg-slate-600 transition-colors"
                >
                    {filters.sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
                </button>
            </div>
        </div>
    );
}
