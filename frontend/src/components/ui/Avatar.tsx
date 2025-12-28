/**
 * Avatar Component
 * Displays user avatar or initials fallback
 */

import { User } from 'lucide-react';
import clsx from 'clsx';

interface AvatarProps {
    src?: string | null;
    name: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
};

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
    const initials = name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const fullSrc = src ? `${apiUrl}${src}` : null;

    return (
        <div
            className={clsx(
                'rounded-full flex items-center justify-center overflow-hidden',
                sizeClasses[size],
                className
            )}
        >
            {fullSrc ? (
                <img
                    src={fullSrc}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // Fallback to initials if image fails to load
                        e.currentTarget.style.display = 'none';
                    }}
                />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {initials || <User className="w-1/2 h-1/2" />}
                </div>
            )}
        </div>
    );
}
