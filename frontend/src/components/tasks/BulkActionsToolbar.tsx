/**
 * Bulk Actions Toolbar
 * Appears when tasks are selected, provides bulk operations
 */

import { useState } from 'react';
import { X, CheckCircle, Circle, Clock, RotateCcw, Trash2, ArrowUpDown } from 'lucide-react';
import clsx from 'clsx';
import { Button } from '../ui/Button';
import type { Status, Priority } from '../../types';

interface BulkActionsToolbarProps {
    selectedCount: number;
    onClearSelection: () => void;
    onStatusChange: (status: Status) => void;
    onPriorityChange: (priority: Priority) => void;
    onDelete: () => void;
    isLoading?: boolean;
    canDelete?: boolean;
}

const statusOptions: { value: Status; label: string; icon: typeof Circle; color: string }[] = [
    { value: 'TODO', label: 'To Do', icon: Circle, color: 'text-slate-400' },
    { value: 'IN_PROGRESS', label: 'In Progress', icon: Clock, color: 'text-blue-400' },
    { value: 'REVIEW', label: 'Review', icon: RotateCcw, color: 'text-purple-400' },
    { value: 'COMPLETED', label: 'Completed', icon: CheckCircle, color: 'text-green-400' },
];

const priorityOptions: { value: Priority; label: string; color: string }[] = [
    { value: 'LOW', label: 'Low', color: 'text-green-400' },
    { value: 'MEDIUM', label: 'Medium', color: 'text-yellow-400' },
    { value: 'HIGH', label: 'High', color: 'text-orange-400' },
    { value: 'URGENT', label: 'Urgent', color: 'text-red-400' },
];

export function BulkActionsToolbar({
    selectedCount,
    onClearSelection,
    onStatusChange,
    onPriorityChange,
    onDelete,
    isLoading = false,
    canDelete = false,
}: BulkActionsToolbarProps) {
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
            <div className="flex items-center gap-3 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl px-4 py-3 shadow-2xl shadow-black/50">
                {/* Selection count */}
                <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
                    <span className="text-sm font-medium text-white">{selectedCount}</span>
                    <span className="text-sm text-slate-400">selected</span>
                    <button
                        onClick={onClearSelection}
                        className="p-1 text-slate-400 hover:text-white rounded transition-colors"
                        title="Clear selection"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Status dropdown */}
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setShowStatusDropdown(!showStatusDropdown);
                            setShowPriorityDropdown(false);
                        }}
                        disabled={isLoading}
                        leftIcon={<CheckCircle className="w-4 h-4" />}
                    >
                        Set Status
                    </Button>
                    {showStatusDropdown && (
                        <div className="absolute bottom-full left-0 mb-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
                            {statusOptions.map((option) => {
                                const Icon = option.icon;
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            onStatusChange(option.value);
                                            setShowStatusDropdown(false);
                                        }}
                                        className={clsx(
                                            'w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-slate-700 transition-colors',
                                            option.color
                                        )}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Priority dropdown */}
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setShowPriorityDropdown(!showPriorityDropdown);
                            setShowStatusDropdown(false);
                        }}
                        disabled={isLoading}
                        leftIcon={<ArrowUpDown className="w-4 h-4" />}
                    >
                        Set Priority
                    </Button>
                    {showPriorityDropdown && (
                        <div className="absolute bottom-full left-0 mb-2 w-40 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
                            {priorityOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        onPriorityChange(option.value);
                                        setShowPriorityDropdown(false);
                                    }}
                                    className={clsx(
                                        'w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-slate-700 transition-colors',
                                        option.color
                                    )}
                                >
                                    <span className="w-2 h-2 rounded-full bg-current" />
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Delete button (only for creators/admins) */}
                {canDelete && (
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={onDelete}
                        disabled={isLoading}
                        leftIcon={<Trash2 className="w-4 h-4" />}
                    >
                        Delete
                    </Button>
                )}
            </div>
        </div>
    );
}
