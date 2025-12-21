/**
 * Priority Donut - Donut chart showing task distribution by priority
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface PriorityDonutProps {
    data: {
        low: number;
        medium: number;
        high: number;
        urgent: number;
    };
}

const PRIORITY_CONFIG = [
    { key: 'low', label: 'Low', color: '#22c55e', darkColor: 'rgba(34, 197, 94, 0.2)' },
    { key: 'medium', label: 'Medium', color: '#f59e0b', darkColor: 'rgba(245, 158, 11, 0.2)' },
    { key: 'high', label: 'High', color: '#f97316', darkColor: 'rgba(249, 115, 22, 0.2)' },
    { key: 'urgent', label: 'Urgent', color: '#ef4444', darkColor: 'rgba(239, 68, 68, 0.2)' },
];

export function PriorityDonut({ data }: PriorityDonutProps) {
    const chartData = PRIORITY_CONFIG.map((config) => ({
        name: config.label,
        value: data[config.key as keyof typeof data],
        color: config.color,
    })).filter((d) => d.value > 0);

    const total = Object.values(data).reduce((sum, v) => sum + v, 0);

    if (total === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                <div className="text-4xl mb-2">📭</div>
                <p>No tasks yet</p>
            </div>
        );
    }

    return (
        <div className="flex items-center h-full w-full">
            <div className="flex-1 h-full relative min-h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius="60%"
                            outerRadius="80%"
                            paddingAngle={4}
                            dataKey="value"
                            strokeWidth={0}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    style={{
                                        filter: `drop-shadow(0 0 6px ${entry.color}40)`,
                                    }}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(30, 41, 59, 0.95)',
                                border: '1px solid rgba(100, 116, 139, 0.3)',
                                borderRadius: '12px',
                                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                            }}
                            labelStyle={{ color: '#f8fafc', fontWeight: 600 }}
                            itemStyle={{ color: '#94a3b8' }}
                            formatter={(value: number | undefined) => [`${value || 0} tasks`, '']}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-white">{total}</span>
                    <span className="text-[10px] text-slate-400">Total</span>
                </div>
            </div>

            {/* Legend - Vertical Right Side */}
            <div className="w-1/3 flex flex-col justify-center gap-1.5 pl-2 pr-1">
                {PRIORITY_CONFIG.map((config) => {
                    const value = data[config.key as keyof typeof data];
                    return (
                        <div
                            key={config.key}
                            className="flex items-center gap-1.5"
                        >
                            <div
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: config.color }}
                            />
                            <span className="text-[10px] text-slate-300 flex-1 truncate">
                                {config.label}
                            </span>
                            <span className="text-[10px] font-medium text-white">
                                {value}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
