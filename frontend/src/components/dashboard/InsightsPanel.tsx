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
            return 'border-l-orange-500 bg-orange-500/5';
        }
        if (insight.toLowerCase().includes('impressive') || insight.toLowerCase().includes('excellent')) {
            return 'border-l-green-500 bg-green-500/5';
        }
        return 'border-l-indigo-500 bg-indigo-500/5';
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-2 py-3">
                <Lightbulb className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <h2 className="font-semibold text-white text-sm">Smart Insights</h2>
            </CardHeader>
            <CardBody className="pt-0">
                <div className="space-y-2">
                    {insights.map((insight, index) => (
                        <div
                            key={index}
                            className={`p-3 rounded-lg border-l-4 ${getColor(insight)} transition-all duration-200 hover:scale-[1.01]`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                    {getIcon(insight)}
                                </div>
                                <p className="text-sm text-slate-200 leading-relaxed flex-1">
                                    {insight}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                {insights.length === 0 && (
                    <div className="text-center py-8">
                        <Lightbulb className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-sm text-slate-400">No insights available yet</p>
                        <p className="text-xs text-slate-500 mt-1">
                            Complete more tasks to generate insights
                        </p>
                    </div>
                )}
            </CardBody>
        </Card>
    );
}
