/**
 * Reusable Input component with label and error handling
 */

import { forwardRef, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className, id, ...props }, ref) => {
        const inputId = id || props.name;

        return (
            <div className="space-y-1.5">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-slate-300"
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={clsx(
                        'w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-white placeholder-slate-500',
                        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
                        'transition-all duration-200',
                        error
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-slate-700 hover:border-slate-600',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="text-sm text-red-400 animate-fade-in">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

/**
 * Textarea component
 */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, className, id, ...props }, ref) => {
        const textareaId = id || props.name;

        return (
            <div className="space-y-1.5">
                {label && (
                    <label
                        htmlFor={textareaId}
                        className="block text-sm font-medium text-slate-300"
                    >
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={textareaId}
                    className={clsx(
                        'w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-white placeholder-slate-500',
                        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
                        'transition-all duration-200 resize-none',
                        error
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-slate-700 hover:border-slate-600',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="text-sm text-red-400 animate-fade-in">{error}</p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

/**
 * Select component
 */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, className, id, options, ...props }, ref) => {
        const selectId = id || props.name;

        return (
            <div className="space-y-1.5">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="block text-sm font-medium text-slate-300"
                    >
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    id={selectId}
                    className={clsx(
                        'w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-white',
                        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
                        'transition-all duration-200',
                        error
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-slate-700 hover:border-slate-600',
                        className
                    )}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <p className="text-sm text-red-400 animate-fade-in">{error}</p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';
