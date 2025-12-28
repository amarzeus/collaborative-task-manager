/**
 * Trend Chart - Line chart showing task completion trends
 */

import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from 'recharts';

interface TrendChartProps {
    data: { date: string; completed: number; created: number }[];
    title?: string;
}

export function TrendChart({ data }: Omit<TrendChartProps, 'title'>) {
    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(51, 65, 85, 0.5)"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 10 }}
                            dy={5}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 10 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(30, 41, 59, 0.95)',
                                border: '1px solid rgba(100, 116, 139, 0.3)',
                                borderRadius: '12px',
                                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                            }}
                            labelStyle={{ color: '#f8fafc', fontWeight: 600 }}
                            itemStyle={{ color: '#94a3b8' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="completed"
                            name="Completed"
                            stroke="#10b981"
                            strokeWidth={2}
                            fill="url(#completedGradient)"
                        />
                        <Area
                            type="monotone"
                            dataKey="created"
                            name="Created"
                            stroke="#6366f1"
                            strokeWidth={2}
                            fill="url(#createdGradient)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Legend - compact inline */}
            <div className="flex items-center justify-center gap-4 pt-1">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-slate-400">Completed</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="text-[10px] text-slate-400">Created</span>
                </div>
            </div>
        </div>
    );
}
