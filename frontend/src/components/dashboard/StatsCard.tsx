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
    onClick?: () => void; // Click handler for navigation
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
    onClick,
}: StatsCardProps) {
    const config = colorConfig[color];

    const chartData = useMemo(() => {
        if (!sparklineData) return null;
        return sparklineData.map((v, i) => ({ value: v, index: i }));
    }, [sparklineData]);

    return (
        <div
            onClick={onClick}
            className={`
                relative overflow-hidden rounded-xl p-4
                bg-slate-800/60 backdrop-blur-sm
                border ${config.border}
                transition-all duration-200 ease-out
                hover:bg-slate-800/80 hover:shadow-lg ${config.glow}
                group cursor-pointer
            `}
        >
            {/* Header Row */}
            <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${config.icon}`}>
                    <Icon className={`w-4 h-4 ${config.text}`} />
                </div>

                {trend !== undefined && (
                    <div className={`flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded ${trend >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                        <span className="text-[10px]">{trend >= 0 ? '▲' : '▼'}</span>
                        <span>{Math.abs(trend)}%</span>
                    </div>
                )}
            </div>

            {/* Value and Title */}
            <div className="mt-3">
                <p className="text-2xl font-bold text-white tracking-tight tabular-nums">
                    {value.toLocaleString()}
                </p>
                <p className={`text-xs ${config.text} font-medium mt-0.5`}>{title}</p>
                {subtitle && (
                    <p className="text-[10px] text-slate-500 mt-0.5">{subtitle}</p>
                )}
            </div>

            {/* Sparkline Chart - More compact */}
            {chartData && (
                <div className="mt-2 h-8 -mx-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke={config.chart}
                                strokeWidth={1.5}
                                dot={false}
                                strokeLinecap="round"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Live indicator */}
            <div className="absolute top-2 right-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] text-slate-500 uppercase tracking-wider">Live</span>
            </div>
        </div>
    );
}
