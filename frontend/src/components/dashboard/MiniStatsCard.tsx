/**
 * Mini Stats Card with hover expand and click dropdown
 * - Default: Mini compact view
 * - Hover: Expands to show sparkline and trend
 * - Click: Opens dropdown panel with detailed data
 */

import { useState, useMemo, useRef, useEffect } from 'react';
import { LineChart, Line, ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';
import type { LucideIcon } from 'lucide-react';
import { ChevronDown, ExternalLink } from 'lucide-react';

interface MiniStatsCardProps {
    title: string;
    value: number;
    icon: LucideIcon;
    color: 'indigo' | 'blue' | 'green' | 'red' | 'orange' | 'purple';
    trend?: number;
    sparklineData?: number[];
    subtitle?: string;
    detailData?: {
        items: Array<{ label: string; value: string | number; trend?: number }>;
        chartData?: Array<{ name: string; value: number }>;
        linkUrl?: string;
        linkLabel?: string;
    };
}

const colorConfig = {
    indigo: {
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/30',
        text: 'text-indigo-400',
        icon: 'bg-indigo-500/20',
        chart: '#6366f1',
        gradient: 'from-indigo-500/20 to-transparent',
    },
    blue: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        icon: 'bg-blue-500/20',
        chart: '#3b82f6',
        gradient: 'from-blue-500/20 to-transparent',
    },
    green: {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        icon: 'bg-emerald-500/20',
        chart: '#10b981',
        gradient: 'from-emerald-500/20 to-transparent',
    },
    red: {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
        icon: 'bg-red-500/20',
        chart: '#ef4444',
        gradient: 'from-red-500/20 to-transparent',
    },
    orange: {
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30',
        text: 'text-orange-400',
        icon: 'bg-orange-500/20',
        chart: '#f97316',
        gradient: 'from-orange-500/20 to-transparent',
    },
    purple: {
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        text: 'text-purple-400',
        icon: 'bg-purple-500/20',
        chart: '#a855f7',
        gradient: 'from-purple-500/20 to-transparent',
    },
};

export function MiniStatsCard({
    title,
    value,
    icon: Icon,
    color,
    trend,
    sparklineData,
    subtitle,
    detailData,
}: MiniStatsCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const config = colorConfig[color];

    const chartData = useMemo(() => {
        if (!sparklineData) return null;
        return sparklineData.map((v, i) => ({ value: v, index: i }));
    }, [sparklineData]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
                setIsExpanded(false);
            }
        };
        if (isExpanded) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isExpanded]);

    return (
        <div ref={cardRef} className="relative">
            {/* Main Card */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`
                    relative overflow-hidden rounded-lg cursor-pointer
                    bg-slate-800/80 backdrop-blur-sm border ${config.border}
                    transition-all duration-300 ease-out
                    ${isHovered ? 'shadow-lg scale-[1.02]' : ''}
                    ${isExpanded ? 'ring-2 ring-indigo-500/50' : ''}
                `}
            >
                {/* Mini View (Always visible) */}
                <div className={`p-3 transition-all duration-300 ${isHovered ? 'pb-2' : ''}`}>
                    <div className="flex items-center justify-between gap-2">
                        <div className={`p-1.5 rounded-md ${config.icon}`}>
                            <Icon className={`w-3.5 h-3.5 ${config.text}`} />
                        </div>
                        <div className="flex-1 min-w-0 text-right">
                            <p className="text-lg font-bold text-white tabular-nums leading-none">
                                {value.toLocaleString()}
                            </p>
                            <p className={`text-[10px] ${config.text} font-medium truncate mt-0.5`}>
                                {title}
                            </p>
                        </div>
                        {trend !== undefined && (
                            <div className={`text-[10px] font-medium px-1 py-0.5 rounded ${trend >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                {trend >= 0 ? '▲' : '▼'}{Math.abs(trend)}%
                            </div>
                        )}
                    </div>

                    {/* Expanded Content on Hover */}
                    <div className={`overflow-hidden transition-all duration-300 ${isHovered ? 'max-h-20 opacity-100 mt-2' : 'max-h-0 opacity-0'
                        }`}>
                        {chartData && (
                            <div className="h-8">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <Line
                                            type="monotone"
                                            dataKey="value"
                                            stroke={config.chart}
                                            strokeWidth={1.5}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                        {subtitle && (
                            <p className="text-[9px] text-slate-500 text-center">{subtitle}</p>
                        )}
                    </div>

                    {/* Click indicator */}
                    <div className={`flex justify-center transition-all duration-200 ${isHovered ? 'opacity-100 mt-1' : 'opacity-0 h-0'
                        }`}>
                        <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''
                            }`} />
                    </div>
                </div>

                {/* Live indicator */}
                <div className="absolute top-1.5 right-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse block" />
                </div>
            </div>

            {/* Dropdown Panel */}
            {isExpanded && (
                <div className={`
                    absolute top-full left-0 right-0 mt-2 z-50
                    bg-slate-800 border ${config.border} rounded-xl shadow-2xl
                    animate-fade-in overflow-hidden min-w-[280px]
                `}>
                    {/* Header */}
                    <div className={`p-4 border-b border-slate-700 bg-gradient-to-r ${config.gradient}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${config.icon}`}>
                                <Icon className={`w-5 h-5 ${config.text}`} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
                                <p className={`text-sm ${config.text}`}>{title}</p>
                            </div>
                        </div>
                    </div>

                    {/* Detail Items */}
                    {detailData?.items && (
                        <div className="p-3 space-y-2">
                            {detailData.items.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                                    <span className="text-xs text-slate-400">{item.label}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-white">{item.value}</span>
                                        {item.trend !== undefined && (
                                            <span className={`text-[10px] ${item.trend >= 0 ? 'text-emerald-400' : 'text-red-400'
                                                }`}>
                                                {item.trend >= 0 ? '↑' : '↓'}{Math.abs(item.trend)}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Chart in dropdown */}
                    {detailData?.chartData && (
                        <div className="px-3 pb-3">
                            <div className="h-24 bg-slate-700/20 rounded-lg p-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={detailData.chartData}>
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fontSize: 9, fill: '#64748b' }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                background: '#1e293b',
                                                border: '1px solid #334155',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke={config.chart}
                                            fill={config.chart}
                                            fillOpacity={0.2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Link to full page */}
                    {detailData?.linkUrl && (
                        <div className="p-3 border-t border-slate-700">
                            <a
                                href={detailData.linkUrl}
                                className="flex items-center justify-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                <ExternalLink className="w-3 h-3" />
                                {detailData.linkLabel || 'View Details'}
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
