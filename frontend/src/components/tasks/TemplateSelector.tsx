/**
 * Template Selector Component
 * Dropdown to select from saved templates and apply to task form
 */

import { useState } from 'react';
import { FileText, ChevronDown, Globe, User, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { useTemplates, useDeleteTemplate, TaskTemplate } from '../../hooks/useTemplates';
import { Button } from '../ui/Button';

interface TemplateSelectorProps {
    onSelect: (template: TaskTemplate) => void;
    disabled?: boolean;
}

export function TemplateSelector({ onSelect, disabled = false }: TemplateSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { data: templates, isLoading } = useTemplates();
    const deleteTemplate = useDeleteTemplate();

    const handleSelect = (template: TaskTemplate) => {
        onSelect(template);
        setIsOpen(false);
    };

    const handleDelete = async (e: React.MouseEvent, templateId: string) => {
        e.stopPropagation();
        await deleteTemplate.mutateAsync(templateId);
    };

    if (!templates?.length && !isLoading) {
        return null; // Don't render if no templates
    }

    return (
        <div className="relative">
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled || isLoading}
                leftIcon={<FileText className="w-4 h-4" />}
                rightIcon={<ChevronDown className={clsx("w-4 h-4 transition-transform", isOpen && "rotate-180")} />}
            >
                {isLoading ? 'Loading...' : 'Use Template'}
            </Button>

            {isOpen && templates && templates.length > 0 && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute top-full left-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden animate-fade-in">
                        <div className="p-2 border-b border-slate-700">
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider px-2">
                                Templates ({templates.length})
                            </p>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {templates.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => handleSelect(template)}
                                    className="w-full flex items-start gap-3 px-3 py-2 text-left hover:bg-slate-700 transition-colors group"
                                >
                                    <div className="flex-shrink-0 mt-0.5">
                                        {template.isGlobal ? (
                                            <Globe className="w-4 h-4 text-indigo-400" />
                                        ) : (
                                            <User className="w-4 h-4 text-slate-500" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                            {template.name}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate">
                                            {template.title}
                                        </p>
                                    </div>
                                    {!template.isGlobal && (
                                        <button
                                            onClick={(e) => handleDelete(e, template.id)}
                                            className="flex-shrink-0 p-1 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                            title="Delete template"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
