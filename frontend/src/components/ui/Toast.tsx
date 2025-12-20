/**
 * Toast notification component
 */

import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import clsx from 'clsx';
import type { Notification } from '../../types';

interface ToastProps {
    notifications: Partial<Notification>[];
    onRemove: (index: number) => void;
}

export function ToastContainer({ notifications, onRemove }: ToastProps) {
    if (notifications.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
            {notifications.map((notification, index) => (
                <div
                    key={index}
                    className={clsx(
                        'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-slide-up',
                        'bg-slate-800 border border-slate-700'
                    )}
                >
                    <div className="flex-shrink-0">
                        {notification.type === 'ASSIGNMENT' ? (
                            <Info className="w-5 h-5 text-blue-400" />
                        ) : notification.type === 'SUCCESS' ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-yellow-400" />
                        )}
                    </div>
                    <p className="text-sm text-white">{notification.message}</p>
                    <button
                        onClick={() => onRemove(index)}
                        className="flex-shrink-0 p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
