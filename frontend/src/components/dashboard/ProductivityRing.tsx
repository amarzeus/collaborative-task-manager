/**
 * Productivity Ring - Circular progress indicator showing productivity score
 */

import { useMemo, useEffect, useState } from 'react';

interface ProductivityRingProps {
    completed: number;
    total: number;
    size?: number;
    strokeWidth?: number;
}

export function ProductivityRing({
    completed,
    total,
    size = 180,
    strokeWidth = 12
}: ProductivityRingProps) {
    const [animatedPercentage, setAnimatedPercentage] = useState(0);

    const percentage = useMemo(() => {
        if (total === 0) return 0;
        return Math.round((completed / total) * 100);
    }, [completed, total]);

    // Animate the percentage on mount/change
    useEffect(() => {
        const duration = 1500;
        const startTime = Date.now();
        const startValue = animatedPercentage;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = startValue + (percentage - startValue) * easeOut;

            setAnimatedPercentage(Math.round(current));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [percentage]);

    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (animatedPercentage / 100) * circumference;

    // Color based on productivity level
    const getColor = () => {
        if (animatedPercentage >= 80) return { stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' };
        if (animatedPercentage >= 50) return { stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' };
        return { stroke: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' };
    };

    const colors = getColor();

    const getLabel = () => {
        if (animatedPercentage >= 80) return { text: 'Excellent!', emoji: '🔥' };
        if (animatedPercentage >= 50) return { text: 'Good Progress', emoji: '👍' };
        if (animatedPercentage >= 20) return { text: 'Keep Going', emoji: '💪' };
        return { text: 'Get Started', emoji: '🚀' };
    };

    const label = getLabel();

    return (
        <div className="relative flex flex-col items-center justify-center p-6">
            {/* Glow effect behind ring */}
            <div
                className="absolute inset-0 rounded-full opacity-30 blur-2xl transition-all duration-500"
                style={{
                    background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
                }}
            />

            <svg
                width={size}
                height={size}
                className="transform -rotate-90 drop-shadow-lg"
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="rgba(51, 65, 85, 0.5)"
                    strokeWidth={strokeWidth}
                />

                {/* Animated progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={colors.stroke}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{
                        transition: 'stroke-dashoffset 0.5s ease-out, stroke 0.5s ease',
                        filter: `drop-shadow(0 0 8px ${colors.glow})`,
                    }}
                />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white tabular-nums">
                    {animatedPercentage}%
                </span>
                <span className="text-sm text-slate-400 mt-1">
                    Productivity
                </span>
            </div>

            {/* Label below ring */}
            <div className="mt-4 text-center">
                <span className="text-lg mr-2">{label.emoji}</span>
                <span className="text-sm font-medium text-slate-300">{label.text}</span>
            </div>

            {/* Stats below */}
            <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                <span>{completed} completed</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span>{total - completed} remaining</span>
            </div>
        </div>
    );
}
