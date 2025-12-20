/**
 * Protected Layout with enhanced navigation, notifications, and user menu
 */

import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ListTodo,
    User,
    LogOut,
    Bell,
    Menu,
    X,
    CheckCircle2,
    Settings,
    ChevronDown,
    Trash2,
    Check,
    ExternalLink,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../../hooks/useNotifications';
import { ToastContainer } from '../ui/Toast';

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tasks', label: 'Tasks', icon: ListTodo },
    { path: '/profile', label: 'Profile', icon: User },
];

export function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { data, toasts, removeToast } = useNotifications();
    const markAsRead = useMarkAsRead();
    const markAllAsRead = useMarkAllAsRead();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const notifRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setNotifOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleMarkAsRead = (id: string) => {
        markAsRead.mutate(id);
    };

    return (
        <div className="min-h-screen flex">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800">
                {/* Logo */}
                <div className="p-6">
                    <Link to="/dashboard" className="flex items-center gap-2">
                        <CheckCircle2 className="w-8 h-8 text-indigo-500" />
                        <span className="text-xl font-bold gradient-text">TaskFlow</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                                    isActive
                                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User section removed as per refinement plan */}
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top header */}
                <header className="sticky top-0 z-40 h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-4 lg:px-6 flex items-center justify-between">
                    {/* Mobile menu button */}
                    <button
                        className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>

                    <div className="hidden lg:block" />

                    {/* Right side - Notifications and User Menu */}
                    <div className="flex items-center gap-3">
                        {/* Enhanced Notifications */}
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => setNotifOpen(!notifOpen)}
                                className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <Bell className="w-5 h-5" />
                                {data?.unreadCount ? (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                                        {data.unreadCount > 9 ? '9+' : data.unreadCount}
                                    </span>
                                ) : null}
                            </button>

                            {/* Enhanced Notification Panel */}
                            {notifOpen && (
                                <div className="absolute right-0 top-12 w-96 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl animate-fade-in overflow-hidden">
                                    {/* Header */}
                                    <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
                                        <div>
                                            <h3 className="font-semibold text-white">Notifications</h3>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {data?.unreadCount ? `${data.unreadCount} unread` : 'All caught up!'}
                                            </p>
                                        </div>
                                        {data?.unreadCount ? (
                                            <button
                                                onClick={() => markAllAsRead.mutate()}
                                                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 px-2 py-1 hover:bg-indigo-500/10 rounded transition-colors"
                                            >
                                                <Check className="w-3 h-3" />
                                                Mark all read
                                            </button>
                                        ) : null}
                                    </div>

                                    {/* Notifications List */}
                                    <div className="max-h-96 overflow-y-auto">
                                        {data?.notifications?.length ? (
                                            data.notifications.map((notif) => (
                                                <div
                                                    key={notif.id}
                                                    className={clsx(
                                                        'group p-4 border-b border-slate-700/50 last:border-0 hover:bg-slate-700/30 transition-colors',
                                                        !notif.read && 'bg-indigo-500/5 border-l-2 border-l-indigo-500'
                                                    )}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-slate-200 leading-relaxed">
                                                                {notif.message}
                                                            </p>
                                                            <p className="text-xs text-slate-500 mt-1.5">
                                                                {new Date(notif.createdAt).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {!notif.read && (
                                                                <button
                                                                    onClick={() => handleMarkAsRead(notif.id)}
                                                                    className="p-1.5 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded transition-colors"
                                                                    title="Mark as read"
                                                                >
                                                                    <Check className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center">
                                                <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                                <p className="text-sm text-slate-400">No notifications yet</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    We'll notify you when something happens
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    {data?.notifications?.length ? (
                                        <div className="p-3 border-t border-slate-700 bg-slate-800/50">
                                            <Link
                                                to="/notifications"
                                                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1 py-1"
                                                onClick={() => setNotifOpen(false)}
                                            >
                                                View all notifications
                                                <ExternalLink className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    ) : null}
                                </div>
                            )}
                        </div>

                        {/* User Account Menu */}
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2 px-2 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium ring-2 ring-slate-700">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="hidden md:block text-sm font-medium">{user?.name}</span>
                                <ChevronDown className={clsx(
                                    'w-4 h-4 transition-transform',
                                    userMenuOpen && 'rotate-180'
                                )} />
                            </button>

                            {/* User Dropdown Menu */}
                            {userMenuOpen && (
                                <div className="absolute right-0 top-12 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl animate-fade-in overflow-hidden">
                                    {/* User Info */}
                                    <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                                        <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                                        <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email}</p>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="p-2">
                                        <Link
                                            to="/profile"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                        >
                                            <User className="w-4 h-4" />
                                            Profile
                                        </Link>
                                        <Link
                                            to="/profile"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                        >
                                            <Settings className="w-4 h-4" />
                                            Settings
                                        </Link>
                                    </div>

                                    {/* Logout */}
                                    <div className="p-2 border-t border-slate-700">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
                        <div className="w-64 h-full bg-slate-900 p-4" onClick={(e) => e.stopPropagation()}>
                            <nav className="space-y-1">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={clsx(
                                                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                                                isActive
                                                    ? 'bg-indigo-500/20 text-indigo-400'
                                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                            )}
                                        >
                                            <Icon className="w-5 h-5" />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Logout
                                </button>
                            </nav>
                        </div>
                    </div>
                )}

                {/* Page content */}
                <main className="flex-1 p-4 lg:p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>

            {/* Toast notifications */}
            <ToastContainer notifications={toasts} onRemove={removeToast} />
        </div>
    );
}
