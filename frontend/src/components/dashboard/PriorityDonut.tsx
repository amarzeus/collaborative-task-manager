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
        <div className="relative">
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
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
                            formatter={(value: number) => [`${value} tasks`, '']}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-white">{total}</span>
                    <span className="text-xs text-slate-400">Total Tasks</span>
                </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4">
                {PRIORITY_CONFIG.map((config) => {
                    const value = data[config.key as keyof typeof data];
                    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

                    return (
                        <div
                            key={config.key}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg"
                            style={{ backgroundColor: config.darkColor }}
                        >
                            <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: config.color }}
                            />
                            <span className="text-xs text-slate-300 flex-1">
                                {config.label}
                            </span>
                            <span className="text-xs font-medium text-white">
                                {value}
                            </span>
                            <span className="text-xs text-slate-500">
                                ({percentage}%)
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
