/**
 * Enhanced Stats Card with sparkline mini-chart and animations
 */

import { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: number;
    icon: LucideIcon;
    color: 'indigo' | 'blue' | 'green' | 'red' | 'orange' | 'purple';
    trend?: number; // Percentage change
    sparklineData?: number[];
    subtitle?: string;
}

const colorConfig = {
    indigo: {
        bg: 'from-indigo-500/20 via-indigo-500/10 to-transparent',
        border: 'border-indigo-500/30',
        text: 'text-indigo-400',
        icon: 'bg-indigo-500/20',
        chart: '#6366f1',
        glow: 'hover:shadow-indigo-500/20',
    },
    blue: {
        bg: 'from-blue-500/20 via-blue-500/10 to-transparent',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        icon: 'bg-blue-500/20',
        chart: '#3b82f6',
        glow: 'hover:shadow-blue-500/20',
    },
    green: {
        bg: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        icon: 'bg-emerald-500/20',
        chart: '#10b981',
        glow: 'hover:shadow-emerald-500/20',
    },
    red: {
        bg: 'from-red-500/20 via-red-500/10 to-transparent',
        border: 'border-red-500/30',
        text: 'text-red-400',
        icon: 'bg-red-500/20',
        chart: '#ef4444',
        glow: 'hover:shadow-red-500/20',
    },
    orange: {
        bg: 'from-orange-500/20 via-orange-500/10 to-transparent',
        border: 'border-orange-500/30',
        text: 'text-orange-400',
        icon: 'bg-orange-500/20',
        chart: '#f97316',
        glow: 'hover:shadow-orange-500/20',
    },
    purple: {
        bg: 'from-purple-500/20 via-purple-500/10 to-transparent',
        border: 'border-purple-500/30',
        text: 'text-purple-400',
        icon: 'bg-purple-500/20',
        chart: '#a855f7',
        glow: 'hover:shadow-purple-500/20',
    },
};

export function StatsCard({
    title,
    value,
    icon: Icon,
    color,
    trend,
    sparklineData,
    subtitle,
}: StatsCardProps) {
    const config = colorConfig[color];

    const chartData = useMemo(() => {
        if (!sparklineData) return null;
        return sparklineData.map((v, i) => ({ value: v, index: i }));
    }, [sparklineData]);

    return (
        <div
            className={`
                relative overflow-hidden rounded-2xl p-5
                bg-gradient-to-br ${config.bg}
                border ${config.border}
                backdrop-blur-sm
                transition-all duration-300 ease-out
                hover:scale-[1.02] hover:shadow-xl ${config.glow}
                group cursor-pointer
            `}
        >
            {/* Background decoration */}
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/5 blur-2xl group-hover:bg-white/10 transition-all" />

            {/* Header */}
            <div className="relative flex items-start justify-between">
                <div className={`p-2.5 rounded-xl ${config.icon} ${config.text}`}>
                    <Icon className="w-5 h-5" />
                </div>

                {trend !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                        <span>{trend >= 0 ? '↑' : '↓'}</span>
                        <span>{Math.abs(trend)}%</span>
                    </div>
                )}
            </div>

            {/* Value and Title */}
            <div className="relative mt-4">
                <p className="text-3xl font-bold text-white tracking-tight tabular-nums">
                    {value.toLocaleString()}
                </p>
                <p className={`text-sm ${config.text} font-medium mt-1`}>{title}</p>
                {subtitle && (
                    <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
                )}
            </div>

            {/* Sparkline Chart */}
            {chartData && (
                <div className="mt-4 h-10 -mx-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke={config.chart}
                                strokeWidth={2}
                                dot={false}
                                strokeLinecap="round"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
