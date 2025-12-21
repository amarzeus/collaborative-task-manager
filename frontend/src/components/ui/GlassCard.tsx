/**
 * GlassCard Component - Glassmorphism design system base
 * Provides consistent glass panel styling with variant support
 */

import type { ReactNode } from 'react';
import clsx from 'clsx';

export type GlassVariant = 'subtle' | 'panel' | 'heavy';

interface GlassCardProps {
    children: ReactNode;
    variant?: GlassVariant;
    className?: string;
    hover?: boolean;
    animate?: boolean;
}

const variantStyles: Record<GlassVariant, string> = {
    subtle: 'backdrop-blur-[4px] bg-slate-950/30',
    panel: 'backdrop-blur-[12px] bg-slate-950/40',
    heavy: 'backdrop-blur-[24px] bg-slate-950/60',
};

/**
 * GlassCard - Premium glassmorphism container
 * 
 * @param variant - 'subtle' | 'panel' | 'heavy' - controls blur intensity
 * @param hover - enables hover effects with indigo glow
 * @param animate - enables fade-in animation
 */
export function GlassCard({
    children,
    variant = 'panel',
    className,
    hover = false,
    animate = false,
}: GlassCardProps) {
    return (
        <div
            className={clsx(
                // Base glass styling
                variantStyles[variant],
                'border border-white/10 rounded-xl',
                // Gradient border effect
                'bg-gradient-to-b from-white/5 to-transparent',
                // Hover effects
                hover && 'hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300',
                // Animation
                animate && 'animate-fade-in',
                className
            )}
        >
            {children}
        </div>
    );
}

interface GlassCardHeaderProps {
    children: ReactNode;
    className?: string;
}

export function GlassCardHeader({ children, className }: GlassCardHeaderProps) {
    return (
        <div className={clsx('px-6 py-4 border-b border-white/10', className)}>
            {children}
        </div>
    );
}

interface GlassCardBodyProps {
    children: ReactNode;
    className?: string;
}

export function GlassCardBody({ children, className }: GlassCardBodyProps) {
    return <div className={clsx('p-6', className)}>{children}</div>;
}

interface GlassCardFooterProps {
    children: ReactNode;
    className?: string;
}

export function GlassCardFooter({ children, className }: GlassCardFooterProps) {
    return (
        <div className={clsx('px-6 py-4 border-t border-white/10', className)}>
            {children}
        </div>
    );
}
