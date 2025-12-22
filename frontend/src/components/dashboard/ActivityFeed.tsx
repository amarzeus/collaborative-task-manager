/**
 * Activity Feed - Real-time activity stream showing recent task events
 */

import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, Plus, Edit, Trash2, UserPlus, Clock } from 'lucide-react';
import type { Task } from '../../types';

interface Activity {
    id: string;
    type: 'created' | 'updated' | 'completed' | 'deleted' | 'assigned';
    taskTitle: string;
    userName: string;
    timestamp: Date;
}

interface ActivityFeedProps {
    tasks?: Task[];
    maxItems?: number;
}

// Generate activities from tasks
function generateActivitiesFromTasks(tasks: Task[]): Activity[] {
    const activities: Activity[] = [];

    tasks.forEach((task) => {
        // Created activity
        activities.push({
            id: `${task.id}-created`,
            type: 'created',
            taskTitle: task.title,
            userName: task.creator?.name || 'Someone',
            timestamp: new Date(task.createdAt),
        });

        // Completed activity
        if (task.status === 'COMPLETED') {
            activities.push({
                id: `${task.id}-completed`,
                type: 'completed',
                taskTitle: task.title,
                userName: task.assignedTo?.name || 'Someone',
                timestamp: new Date(task.updatedAt),
            });
        }

        // Assigned activity
        if (task.assignedTo && task.assignedToId !== task.creatorId) {
            activities.push({
                id: `${task.id}-assigned`,
                type: 'assigned',
                taskTitle: task.title,
                userName: task.assignedTo.name,
                timestamp: new Date(task.createdAt),
            });
        }
    });

    // Sort by timestamp descending
    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

const activityConfig = {
    created: {
        icon: Plus,
        color: 'text-indigo-400',
        bgColor: 'bg-indigo-500/20',
        verb: 'created',
    },
    updated: {
        icon: Edit,
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/20',
        verb: 'updated',
    },
    completed: {
        icon: CheckCircle,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/20',
        verb: 'completed',
    },
    deleted: {
        icon: Trash2,
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        verb: 'deleted',
    },
    assigned: {
        icon: UserPlus,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/20',
        verb: 'was assigned to',
    },
};

export function ActivityFeed({ tasks = [], maxItems = 8 }: ActivityFeedProps) {
    const activities = generateActivitiesFromTasks(tasks).slice(0, maxItems);

    if (activities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-800/50 mb-3">
                    <Clock className="w-6 h-6 opacity-60" />
                </div>
                <p className="text-sm">No recent activity</p>
                <p className="text-xs mt-1 text-slate-600">Create a task to get started!</p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {activities.map((activity, index) => {
                const config = activityConfig[activity.type];
                const Icon = config.icon;

                return (
                    <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors group"
                        style={{
                            animationDelay: `${index * 50}ms`,
                        }}
                    >
                        <div className={`p-2 rounded-lg flex-shrink-0 ${config.bgColor} ${config.color}`}>
                            <Icon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-300 leading-snug">
                                <span className="font-medium text-white">
                                    {activity.userName}
                                </span>{' '}
                                {config.verb}{' '}
                                <span className="font-medium text-white">
                                    "{activity.taskTitle.length > 25
                                        ? activity.taskTitle.slice(0, 25) + '...'
                                        : activity.taskTitle}"
                                </span>
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
