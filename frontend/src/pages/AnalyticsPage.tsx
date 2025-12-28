/**
 * AnalyticsPage - Comprehensive view of user productivity and task trends
 */

import { useState } from 'react';
import { BarChart3, TrendingUp, CheckCircle, Clock, Activity, Zap, Filter, Globe, User as UserIcon, Calendar } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';
import { useAuth } from '../hooks/useAuth';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { TrendChart } from '../components/dashboard/TrendChart';
import { PriorityDonut } from '../components/dashboard/PriorityDonut';
import { InsightsPanel } from '../components/dashboard/InsightsPanel';
import { MiniStatsCard } from '../components/dashboard/MiniStatsCard';
import { ProductivityRing } from '../components/dashboard/ProductivityRing';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid, AreaChart, Area } from 'recharts';
import { AnalyticsScope } from '../lib/analytics-api';
import clsx from 'clsx';

import { Modal } from '../components/ui/Modal';

export type ActiveTab = 'throughput' | 'leadTime' | 'total';

export function AnalyticsPage() {
    const { user } = useAuth();
    const [scope, setScope] = useState<AnalyticsScope>('personal');
    const [days, setDays] = useState(7);
    const [activeTab, setActiveTab] = useState<ActiveTab>('throughput');
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const { data: analytics, isLoading } = useAnalytics(scope, days);

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    <p className="text-slate-400 animate-pulse">Analyzing performance profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-6">
            <div className="space-y-3 animate-fade-in pt-2">
                {/* Header with Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-lg lg:text-xl font-bold text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-indigo-400" />
                            Performance Hub
                        </h1>
                        <p className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">
                            Deep dive into {scope === 'personal' ? 'your' : 'organizational'} productivity patterns.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 self-start md:self-center shadow-sm">
                        {isAdmin && (
                            <div className="flex items-center gap-1 border-r border-slate-700 pr-2 mr-2">
                                <button onClick={() => setScope('personal')} className={clsx("px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5", scope === 'personal' ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" : "text-slate-300 hover:text-white hover:bg-slate-700/50")}>
                                    <UserIcon className="w-3.5 h-3.5" /> Personal
                                </button>
                                <button onClick={() => setScope('global')} className={clsx("px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5", scope === 'global' ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" : "text-slate-300 hover:text-white hover:bg-slate-700/50")}>
                                    <Globe className="w-3.5 h-3.5" /> Global
                                </button>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            {[7, 30, 90].map((d) => (
                                <button key={d} onClick={() => setDays(d)} className={clsx("px-3 py-1.5 rounded-lg text-xs font-semibold transition-all", days === d ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" : "text-slate-300 hover:text-white hover:bg-slate-700/50")}>
                                    {d}d
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-stretch">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-1 flex flex-col gap-3">
                        <Card className="flex flex-col items-center justify-center p-3 bg-slate-900/50 relative overflow-hidden h-[180px] flex-shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
                            <ProductivityRing
                                completed={analytics.trends.reduce((sum, day) => sum + day.completed, 0)}
                                total={Math.max(1, analytics.trends.reduce((sum, day) => sum + day.created, 0))}
                                size={110}
                            />
                        </Card>
                        <InsightsPanel insights={analytics.insights} />
                    </div>

                    {/* Right Area */}
                    <div className="lg:col-span-3 flex flex-col gap-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <MiniStatsCard title="Throughput" value={analytics.productivity.completedThisWeek} icon={Zap} color="indigo" trend={analytics.productivity.throughputTrend} isActive={activeTab === 'throughput'} onClick={() => setActiveTab('throughput')} />
                            <MiniStatsCard title="Avg Lead Time" value={`${analytics.productivity.avgCompletionDays}d`} icon={Clock} color="blue" trend={analytics.productivity.leadTimeTrend} isActive={activeTab === 'leadTime'} onClick={() => setActiveTab('leadTime')} />
                            <MiniStatsCard title="Active Volume" value={analytics.productivity.totalCompleted} icon={CheckCircle} color="green" trend={analytics.productivity.productivityTrend} isActive={activeTab === 'total'} onClick={() => setActiveTab('total')} />
                        </div>

                        <Card className="flex-1 flex flex-col bg-slate-900/30">
                            <CardHeader className="flex items-center justify-between border-b border-slate-800/50 py-2.5 px-4">
                                <div className="flex items-center gap-2">
                                    {activeTab === 'throughput' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                                    {activeTab === 'leadTime' && <Filter className="w-4 h-4 text-blue-400" />}
                                    {activeTab === 'total' && <Activity className="w-4 h-4 text-indigo-400" />}
                                    <h2 className="text-sm font-semibold text-white">
                                        {activeTab === 'throughput' && 'Velocity & Output'}
                                        {activeTab === 'leadTime' && 'Efficiency Analysis'}
                                        {activeTab === 'total' && 'Completion History'}
                                    </h2>
                                </div>
                                <span className="text-[10px] text-slate-500 font-bold px-2 py-0.5 bg-slate-800 rounded uppercase tracking-wider">{days} Day Analysis</span>
                            </CardHeader>
                            <CardBody className="flex-1 flex flex-col pb-2 min-h-[280px]">
                                {activeTab === 'throughput' && <TrendChart data={analytics.trends} />}
                                {activeTab === 'leadTime' && (
                                    <div className="flex-1 flex flex-col pt-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={analytics.efficiency} layout="vertical" margin={{ left: 40, right: 40 }}>
                                                <XAxis type="number" hide />
                                                <YAxis dataKey="status" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 13 }} />
                                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }} />
                                                <Bar dataKey="avgDays" name="Avg Days" radius={[0, 6, 6, 0]} barSize={32}>
                                                    {analytics.efficiency.map((_, index) => <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#ec4899'][index % 3]} />)}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                                {activeTab === 'total' && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={analytics.trends}>
                                            <defs>
                                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                                            <Area type="monotone" dataKey="completed" name="Completed Tasks" stroke="#10b981" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={3} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </CardBody>
                        </Card>
                    </div>
                </div>

                {/* Supplementary Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    <Card className="lg:col-span-4 flex flex-col">
                        <CardHeader className="flex items-center gap-2 border-b border-slate-800/50 pb-4">
                            <BarChart3 className="w-5 h-5 text-purple-400" />
                            <h2 className="text-lg font-semibold text-white">Resource Allocation</h2>
                        </CardHeader>
                        <CardBody className="flex-1 flex flex-col items-center justify-center p-4 min-h-[250px]">
                            <div className="w-full h-full min-h-[200px]">
                                <PriorityDonut data={analytics.priorities} />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="lg:col-span-8 flex flex-col">
                        <CardHeader className="flex items-center justify-between border-b border-slate-800/50 pb-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-orange-400" />
                                <h2 className="text-lg font-semibold text-white">Consistency Map</h2>
                            </div>
                        </CardHeader>
                        <CardBody className="flex-1 p-4 min-h-[250px]">
                            <div className="w-full h-full min-h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analytics.trends}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                                        <Bar dataKey="created" name="New Tasks" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="completed" name="Closed Tasks" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Score Card */}
                <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 overflow-hidden">
                    <CardBody className="p-8 relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Zap className="w-40 h-40" />
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                            <div className="p-5 rounded-3xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 shadow-inner">
                                <Zap className="w-10 h-10" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-2xl font-bold text-white">Performance Score: {analytics.productivity.performanceScore}/1000</h3>
                                <p className="text-slate-400 mt-1 font-medium italic">
                                    {analytics.productivity.performanceScore > 700
                                        ? <>Your consistency is <span className="text-indigo-400 font-bold">top-tier</span>. You've cleared tasks efficiently.</>
                                        : <>Focus on completing high-priority tasks to boost your score.</>
                                    }
                                </p>
                                <div className="mt-4 h-3 w-full bg-slate-800 rounded-full overflow-hidden max-w-xl">
                                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 shadow-lg" style={{ width: `${(analytics.productivity.performanceScore / 1000) * 100}%` }} />
                                </div>
                            </div>
                            <button
                                onClick={() => setIsReportModalOpen(true)}
                                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-xl shadow-indigo-500/20 active:scale-95"
                            >
                                Full Report
                            </button>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Performance Deep Dive Modal */}
            <Modal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                title="Performance Deep Dive"
            >
                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Velocity Score</p>
                            <p className="text-2xl font-bold text-white mt-1">{Math.round((analytics.productivity.completedThisWeek / days) * 100)}%</p>
                            <p className="text-xs text-slate-400 mt-1">Based on {analytics.productivity.completedThisWeek} completions / {days} days</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Efficiency Rating</p>
                            <p className="text-2xl font-bold text-white mt-1">{analytics.productivity.avgCompletionDays > 3 ? 'B-' : 'A+'}</p>
                            <p className="text-xs text-slate-400 mt-1">Avg Lead Time: {analytics.productivity.avgCompletionDays} days</p>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                        <h4 className="text-sm font-bold text-indigo-400 flex items-center gap-2 mb-3">
                            <TrendingUp className="w-4 h-4" />
                            Trend Analysis ({days}d)
                        </h4>
                        <ul className="space-y-3">
                            <li className="flex justify-between items-center">
                                <span className="text-sm text-slate-300">Throughput Growth</span>
                                <span className={clsx("text-sm font-bold", analytics.productivity.throughputTrend >= 0 ? "text-green-400" : "text-red-400")}>
                                    {analytics.productivity.throughputTrend > 0 ? '+' : ''}{analytics.productivity.throughputTrend}%
                                </span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span className="text-sm text-slate-300">Lead Time Improvement</span>
                                <span className={clsx("text-sm font-bold", analytics.productivity.leadTimeTrend >= 0 ? "text-green-400" : "text-red-400")}>
                                    {analytics.productivity.leadTimeTrend > 0 ? '+' : ''}{analytics.productivity.leadTimeTrend}%
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div className="border-t border-slate-800 pt-6">
                        <p className="text-xs text-slate-500 text-center uppercase font-bold tracking-widest mb-4">Recommended Actions</p>
                        <div className="space-y-3">
                            {analytics.insights.map((insight, i) => (
                                <div key={i} className="flex gap-3 text-sm text-slate-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                    {insight}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={() => setIsReportModalOpen(false)}
                            className="px-6 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors font-semibold"
                        >
                            Close
                        </button>
                        <button className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors font-semibold shadow-lg shadow-indigo-500/20">
                            Download PDF
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
