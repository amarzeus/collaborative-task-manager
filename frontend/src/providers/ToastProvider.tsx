/**
 * Toast Provider
 * Global toast notification system with undo support
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface ToastContextType {
    showToast: (toast: Omit<Toast, 'id'>) => void;
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
    showInfo: (message: string) => void;
    showUndo: (message: string, onUndo: () => void, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
};

const styles = {
    success: 'bg-green-500/10 border-green-500/30',
    error: 'bg-red-500/10 border-red-500/30',
    info: 'bg-blue-500/10 border-blue-500/30',
    warning: 'bg-yellow-500/10 border-yellow-500/30',
};

const iconColors = {
    success: 'text-green-400',
    error: 'text-red-400',
    info: 'text-blue-400',
    warning: 'text-yellow-400',
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(7);
        const newToast = { ...toast, id };

        setToasts(prev => [...prev, newToast]);

        // Auto-remove after duration
        if (toast.duration !== 0) {
            setTimeout(() => removeToast(id), toast.duration || 5000);
        }
    }, [removeToast]);

    const showSuccess = useCallback((message: string) => {
        showToast({ message, type: 'success' });
    }, [showToast]);

    const showError = useCallback((message: string) => {
        showToast({ message, type: 'error' });
    }, [showToast]);

    const showInfo = useCallback((message: string) => {
        showToast({ message, type: 'info' });
    }, [showToast]);

    const showUndo = useCallback((message: string, onUndo: () => void, duration = 5000) => {
        showToast({
            message,
            type: 'info',
            duration,
            action: {
                label: 'Undo',
                onClick: onUndo,
            },
        });
    }, [showToast]);

    return (
        <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showUndo }}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
                {toasts.map(toast => {
                    const Icon = icons[toast.type];

                    return (
                        <div
                            key={toast.id}
                            className={clsx(
                                'flex items-center gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-md animate-slide-in-right',
                                styles[toast.type]
                            )}
                        >
                            <Icon className={clsx('w-5 h-5 flex-shrink-0', iconColors[toast.type])} />

                            <p className="flex-1 text-sm font-medium text-white">{toast.message}</p>

                            {toast.action && (
                                <button
                                    onClick={() => {
                                        toast.action!.onClick();
                                        removeToast(toast.id);
                                    }}
                                    className="px-3 py-1 text-sm font-medium bg-white/10 hover:bg-white/20 rounded transition-colors text-white"
                                >
                                    {toast.action.label}
                                </button>
                            )}

                            <button
                                onClick={() => removeToast(toast.id)}
                                className="p-1 hover:bg-white/10 rounded transition-colors text-slate-400 hover:text-white"
                                aria-label="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}
