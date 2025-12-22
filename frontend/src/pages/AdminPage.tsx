/**
 * Admin Dashboard Page
 * Admin-only page for user management and system stats
 */

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAdminStats, useAdminUsers, useSuspendUser, useActivateUser, useUpdateUser } from '../hooks/useAdmin';
import { CreateUserModal } from '../components/admin/CreateUserModal';
import {
    Users,
    UserCheck,
    UserX,
    Shield,
    Activity,
    TrendingUp,
    Search,
    ChevronLeft,
    ChevronRight,
    Edit,
    Ban,
    CheckCircle,
    UserPlus,
    Briefcase,
} from 'lucide-react';
import type { Role } from '../types';

const ROLES: Role[] = ['USER', 'TEAM_LEAD', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'];

// Dark theme role colors
const roleColors: Record<string, string> = {
    USER: 'bg-slate-700/50 text-slate-300 border border-slate-600',
    TEAM_LEAD: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    MANAGER: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    ADMIN: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    SUPER_ADMIN: 'bg-red-500/20 text-red-400 border border-red-500/30',
};

type ModalPreset = 'admin' | 'manager' | 'user' | 'custom';

export function AdminPage() {
    const { user } = useAuth();
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [page, setPage] = useState(1);
    const [editingUser, setEditingUser] = useState<string | null>(null);
    const [editRole, setEditRole] = useState<string>('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [modalPreset, setModalPreset] = useState<ModalPreset>('custom');

    const { data: stats, isLoading: statsLoading } = useAdminStats();
    const { data: usersData, isLoading: usersLoading } = useAdminUsers({
        search: search || undefined,
        role: roleFilter || undefined,
        isActive: statusFilter === '' ? undefined : statusFilter === 'true',
        page,
        limit: 10,
    });

    const suspendUser = useSuspendUser();
    const activateUser = useActivateUser();
    const updateUser = useUpdateUser();

    // Check if current user is admin
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Shield className="w-16 h-16 mx-auto text-red-500 mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                    <p className="text-slate-400">You don't have permission to access this page.</p>
                </div>
            </div>
        );
    }

    const handleSuspend = async (userId: string) => {
        if (confirm('Are you sure you want to suspend this user?')) {
            await suspendUser.mutateAsync(userId);
        }
    };

    const handleActivate = async (userId: string) => {
        await activateUser.mutateAsync(userId);
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        await updateUser.mutateAsync({ id: userId, data: { role: newRole } });
        setEditingUser(null);
    };

    const openModal = (preset: ModalPreset) => {
        setModalPreset(preset);
        setShowCreateModal(true);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                    <p className="text-slate-400 mt-1">Manage users and view system statistics</p>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => openModal('admin')}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm"
                    >
                        <Shield className="w-4 h-4" />
                        Invite Admin
                    </button>
                    <button
                        onClick={() => openModal('manager')}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all shadow-sm"
                    >
                        <Briefcase className="w-4 h-4" />
                        Add Manager
                    </button>
                    <button
                        onClick={() => openModal('user')}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all shadow-sm"
                    >
                        <UserPlus className="w-4 h-4" />
                        Add User
                    </button>
                </div>
            </div>

            {/* Create User Modal */}
            <CreateUserModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                preset={modalPreset}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Users"
                    value={stats?.users.total ?? 0}
                    icon={Users}
                    color="bg-blue-500"
                    loading={statsLoading}
                />
                <StatCard
                    title="Active Users"
                    value={stats?.users.active ?? 0}
                    icon={UserCheck}
                    color="bg-green-500"
                    loading={statsLoading}
                />
                <StatCard
                    title="Suspended Users"
                    value={stats?.users.suspended ?? 0}
                    icon={UserX}
                    color="bg-red-500"
                    loading={statsLoading}
                />
                <StatCard
                    title="Total Tasks"
                    value={stats?.tasks.total ?? 0}
                    icon={Activity}
                    color="bg-purple-500"
                    loading={statsLoading}
                />
            </div>

            {/* Role Distribution */}
            {stats && (
                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl p-6 shadow-lg">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-400" />
                        Role Distribution
                    </h2>
                    <div className="flex flex-wrap gap-4">
                        {Object.entries(stats.users.byRole).map(([role, count]) => (
                            <div key={role} className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[role] || 'bg-slate-700/50 text-slate-300'}`}>
                                    {role.replace('_', ' ')}
                                </span>
                                <span className="text-slate-300 font-medium">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* User Management */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl shadow-lg">
                <div className="p-4 border-b border-slate-800">
                    <h2 className="text-lg font-semibold text-white mb-4">User Management</h2>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-4">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <select
                            value={roleFilter}
                            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                            className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        >
                            <option value="">All Roles</option>
                            {ROLES.map(role => (
                                <option key={role} value={role}>{role.replace('_', ' ')}</option>
                            ))}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        >
                            <option value="">All Status</option>
                            <option value="true">Active</option>
                            <option value="false">Suspended</option>
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-800/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">User</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Role</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Last Login</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Tasks</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {usersLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-4 py-4"><div className="h-4 bg-slate-700 rounded w-32" /></td>
                                        <td className="px-4 py-4"><div className="h-4 bg-slate-700 rounded w-20" /></td>
                                        <td className="px-4 py-4"><div className="h-4 bg-slate-700 rounded w-16" /></td>
                                        <td className="px-4 py-4"><div className="h-4 bg-slate-700 rounded w-24" /></td>
                                        <td className="px-4 py-4"><div className="h-4 bg-slate-700 rounded w-12" /></td>
                                        <td className="px-4 py-4"><div className="h-4 bg-slate-700 rounded w-8 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : usersData?.users.map(u => (
                                <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-medium text-sm border border-indigo-500/30">
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{u.name}</div>
                                                <div className="text-sm text-slate-400">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        {editingUser === u.id ? (
                                            <select
                                                value={editRole}
                                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                className="text-xs bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-200"
                                                autoFocus
                                                onBlur={() => setEditingUser(null)}
                                            >
                                                {ROLES.map(role => (
                                                    <option key={role} value={role}>{role}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleColors[u.role] || 'bg-slate-700/50 text-slate-300'}`}>
                                                {u.role.replace('_', ' ')}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        {u.isActive ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                                                <CheckCircle className="w-3 h-3" /> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                                                <Ban className="w-3 h-3" /> Suspended
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-slate-400">
                                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="text-sm">
                                            <span className="text-white">{u._count?.createdTasks || 0}</span>
                                            <span className="text-slate-500"> / </span>
                                            <span className="text-slate-400">{u._count?.assignedTasks || 0}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        {u.id !== user?.id && (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => { setEditingUser(u.id); setEditRole(u.role); }}
                                                    className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                                                    title="Edit Role"
                                                >
                                                    <Edit className="w-4 h-4 text-slate-400 hover:text-white" />
                                                </button>
                                                {u.isActive ? (
                                                    <button
                                                        onClick={() => handleSuspend(u.id)}
                                                        className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                                                        title="Suspend User"
                                                        disabled={suspendUser.isPending}
                                                    >
                                                        <Ban className="w-4 h-4 text-red-400" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleActivate(u.id)}
                                                        className="p-1.5 hover:bg-green-500/20 rounded-lg transition-colors"
                                                        title="Activate User"
                                                        disabled={activateUser.isPending}
                                                    >
                                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {usersData && usersData.totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between">
                        <div className="text-sm text-slate-400">
                            Showing {((page - 1) * usersData.limit) + 1} to {Math.min(page * usersData.limit, usersData.total)} of {usersData.total} users
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 text-slate-400" />
                            </button>
                            <span className="text-sm text-slate-300">
                                Page {page} of {usersData.totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(usersData.totalPages, p + 1))}
                                disabled={page === usersData.totalPages}
                                className="p-2 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Stat Card Component - Dark Theme
function StatCard({
    title,
    value,
    icon: Icon,
    color,
    loading
}: {
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
    loading?: boolean;
}) {
    return (
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-400">{title}</p>
                    {loading ? (
                        <div className="h-8 w-16 bg-slate-700 rounded animate-pulse mt-1" />
                    ) : (
                        <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );
}
