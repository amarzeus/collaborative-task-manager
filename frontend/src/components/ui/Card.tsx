/**
 * Card component for content containers
 */

import type { ReactNode, HTMLAttributes } from 'react';
import clsx from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    className?: string;
    hover?: boolean;
}

export function Card({ children, className, hover = false, ...props }: CardProps) {
    return (
        <div
            {...props}
            className={clsx(
                'bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl',
                hover && 'hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300',
                className
            )}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps {
    children: ReactNode;
    className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
    return (
        <div className={clsx('px-6 py-4 border-b border-slate-700/50', className)}>
            {children}
        </div>
    );
}

interface CardBodyProps {
    children: ReactNode;
    className?: string;
}

export function CardBody({ children, className }: CardBodyProps) {
    return <div className={clsx('p-6', className)}>{children}</div>;
}

interface CardFooterProps {
    children: ReactNode;
    className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
    return (
        <div className={clsx('px-6 py-4 border-t border-slate-700/50', className)}>
            {children}
        </div>
    );
}
