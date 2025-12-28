/**
 * InsightsPanel Component
 * Displays AI-like smart observations and recommendations
 */

import { Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';

interface InsightsPanelProps {
    insights: string[];
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
    if (!insights || insights.length === 0) {
        return null;
    }

    const getIcon = (insight: string) => {
        if (insight.toLowerCase().includes('overdue') || insight.toLowerCase().includes('consider')) {
            return <AlertCircle className="w-5 h-5 text-orange-400" />;
        }
        if (insight.toLowerCase().includes('impressive') || insight.toLowerCase().includes('excellent')) {
            return <TrendingUp className="w-5 h-5 text-green-400" />;
        }
        return <Lightbulb className="w-5 h-5 text-indigo-400" />;
    };

    const getColor = (insight: string) => {
        if (insight.toLowerCase().includes('overdue') || insight.toLowerCase().includes('consider')) {
            return 'border-l-orange-500 bg-orange-500/10';
        }
        if (insight.toLowerCase().includes('impressive') || insight.toLowerCase().includes('excellent') || insight.toLowerCase().includes('exceptional')) {
            return 'border-l-green-500 bg-green-500/10';
        }
        return 'border-l-indigo-500 bg-indigo-500/10';
    };

    return (
        <Card className="shadow-lg shadow-indigo-500/5 h-full">
            <CardHeader className="flex flex-row items-center gap-2 py-3 border-b border-white/5">
                <div className="p-1.5 rounded-lg bg-indigo-500/10">
                    <Lightbulb className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                </div>
                <h2 className="font-bold text-white text-sm">Smart Insights</h2>
            </CardHeader>
            <CardBody className="py-2 overflow-y-auto max-h-[180px] custom-scrollbar">
                <div className="space-y-2">
                    {insights.map((insight, index) => (
                        <div
                            key={index}
                            className={`p-3 rounded-lg border-l-4 ${getColor(insight)} transition-all duration-300 hover:translate-x-1 shadow-sm`}
                        >
                            <div className="flex items-start gap-2">
                                <div className="mt-0.5 scale-90">
                                    {getIcon(insight)}
                                </div>
                                <p className="text-[13px] font-medium text-white leading-snug flex-1">
                                    {insight}
                                </p>
                            </div>
                        </div>
                    ))}
                    {insights.length === 0 && (
                        <div className="text-center py-10 opacity-60">
                            <Lightbulb className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                            <p className="text-base text-slate-300 font-medium">Scanning for patterns...</p>
                            <p className="text-sm text-slate-500 mt-2 max-w-[200px] mx-auto">
                                Once you complete more tasks, AI observations will appear here.
                            </p>
                        </div>
                    )}
                </div>
            </CardBody>
        </Card>
    );
}
