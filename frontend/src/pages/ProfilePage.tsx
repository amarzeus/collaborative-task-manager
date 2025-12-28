/**
 * Profile Page - Simple profile view with link to full settings
 */

import { Link } from 'react-router-dom';
import {
    User,
    Mail,
    Calendar,
    Settings,
    Shield,
    ArrowRight,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AvatarUpload } from '../components/profile/AvatarUpload';

export function ProfilePage() {
    const { user } = useAuth();

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <User className="w-7 h-7 text-indigo-400" />
                <h1 className="text-2xl font-bold text-white">My Profile</h1>
            </div>

            {/* Profile Card */}
            <Card>
                <CardBody className="text-center py-8">
                    <AvatarUpload />
                    <h2 className="mt-4 text-2xl font-bold text-white">{user?.name}</h2>
                    <p className="mt-1 text-slate-400">{user?.email}</p>

                    {/* Role Badge - Increased top margin for better spacing */}
                    <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 rounded-full">
                        <Shield className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm text-indigo-400 font-medium">
                            {user?.role || 'USER'}
                        </span>
                    </div>
                </CardBody>
            </Card>

            {/* Profile Details */}
            <Card>
                <CardHeader>
                    <h2 className="text-lg font-semibold text-white">Account Details</h2>
                </CardHeader>
                <CardBody className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <div className="flex-shrink-0 p-2.5 bg-indigo-500/20 rounded-lg">
                            <User className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-400">Full Name</p>
                            <p className="text-white font-medium truncate">{user?.name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <div className="flex-shrink-0 p-2.5 bg-indigo-500/20 rounded-lg">
                            <Mail className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-400">Email Address</p>
                            <p className="text-white font-medium truncate">{user?.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <div className="flex-shrink-0 p-2.5 bg-indigo-500/20 rounded-lg">
                            <Calendar className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-400">Member Since</p>
                            <p className="text-white font-medium">
                                {user?.createdAt
                                    ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })
                                    : 'N/A'}
                            </p>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Settings Link */}
            <Card className="hover:border-indigo-500/50 transition-colors cursor-pointer">
                <Link to="/settings">
                    <CardBody className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-indigo-500/20 rounded-lg">
                                <Settings className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-white font-medium">Settings</p>
                                <p className="text-sm text-slate-400">
                                    Manage your account, security, and preferences
                                </p>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-400" />
                    </CardBody>
                </Link>
            </Card>

            {/* Edit Profile Button */}
            <div className="flex justify-center">
                <Link to="/settings">
                    <Button leftIcon={<Settings className="w-4 h-4" />}>
                        Edit Profile & Settings
                    </Button>
                </Link>
            </div>
        </div>
    );
}
