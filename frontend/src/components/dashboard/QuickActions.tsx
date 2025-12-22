import { useState, useEffect } from 'react';
import { Plus, Timer, Calendar, Keyboard, X } from 'lucide-react';
import { FocusModeModal } from './FocusModeModal';
import { CalendarDropdown } from './CalendarDropdown';

interface QuickActionsProps {
    onNewTask: () => void;
}

export function QuickActions({ onNewTask }: QuickActionsProps) {
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [showFocusMode, setShowFocusMode] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input or textarea
            if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
                return;
            }

            // Modifier keys should not trigger these simple shortcuts (except maybe Ctrl for some, but let's keep it simple)
            if (e.ctrlKey || e.altKey || e.metaKey) return;

            switch (e.key.toLowerCase()) {
                case 'n':
                    e.preventDefault();
                    onNewTask();
                    break;
                case 'f':
                    e.preventDefault();
                    setShowFocusMode(true);
                    break;
                case 'c':
                    e.preventDefault();
                    setShowCalendar(true);
                    break;
                case '/':
                    // Search shortcut logic could go here
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onNewTask]);

    const actions = [
        {
            icon: Plus,
            label: 'New Task',
            shortcut: 'N',
            color: 'bg-indigo-500 hover:bg-indigo-600',
            onClick: onNewTask,
        },
        {
            icon: Timer,
            label: 'Focus Mode',
            shortcut: 'F',
            color: 'bg-emerald-500 hover:bg-emerald-600',
            onClick: () => setShowFocusMode(true),
        },
        {
            icon: Calendar,
            label: 'Calendar',
            shortcut: 'C',
            color: 'bg-orange-500 hover:bg-orange-600',
            onClick: () => setShowCalendar(true),
        },
    ];

    const shortcuts = [
        { key: 'N', action: 'New Task' },
        { key: 'F', action: 'Focus Mode' },
        { key: 'C', action: 'Calendar' },
        { key: '/', action: 'Search' },
        { key: 'Esc', action: 'Close Modal' },
    ];

    return (
        <>
            <div className="flex items-center gap-3">
                {actions.map((action) => {
                    const isCalendar = action.label === 'Calendar';

                    const ButtonContent = (
                        <button
                            key={action.label}
                            onClick={action.onClick}
                            className={`
                                flex items-center gap-2.5 px-4 py-2.5 rounded-xl
                                ${action.color}
                                text-white font-medium text-sm
                                shadow-lg shadow-black/20
                                transition-all duration-200
                                hover:scale-105 hover:shadow-xl
                                active:scale-95
                            `}
                            title={`Press '${action.shortcut}'`}
                        >
                            <action.icon className="w-4 h-4 flex-shrink-0" />
                            <span className="hidden sm:inline whitespace-nowrap">{action.label}</span>
                            <kbd className="hidden md:inline-flex items-center justify-center w-6 h-6 rounded bg-white/20 text-[10px] font-mono ml-0.5">
                                {action.shortcut}
                            </kbd>
                        </button>
                    );

                    if (isCalendar) {
                        return (
                            <div key={action.label} className="relative">
                                {ButtonContent}
                                <CalendarDropdown
                                    isOpen={showCalendar}
                                    onClose={() => setShowCalendar(false)}
                                    className="top-full right-0 mt-2"
                                />
                            </div>
                        );
                    }

                    return ButtonContent;
                })}

                <button
                    onClick={() => setShowShortcuts(!showShortcuts)}
                    className={`
                        p-2.5 rounded-xl border transition-all duration-200
                        ${showShortcuts
                            ? 'bg-slate-700 border-slate-600'
                            : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50'}
                    `}
                    title="Keyboard shortcuts"
                >
                    <Keyboard className="w-4 h-4 text-slate-400" />
                </button>
            </div>

            {/* Focus Mode Modal */}
            <FocusModeModal
                isOpen={showFocusMode}
                onClose={() => setShowFocusMode(false)}
            />

            {/* Shortcuts Modal */}
            {showShortcuts && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-80 shadow-2xl animate-fade-in">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">
                                Keyboard Shortcuts
                            </h3>
                            <button
                                onClick={() => setShowShortcuts(false)}
                                className="p-1 rounded-lg hover:bg-slate-700 transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {shortcuts.map((s) => (
                                <div
                                    key={s.key}
                                    className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0"
                                >
                                    <span className="text-sm text-slate-300">{s.action}</span>
                                    <kbd className="px-2 py-1 rounded bg-slate-700 text-slate-300 text-xs font-mono">
                                        {s.key}
                                    </kbd>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
