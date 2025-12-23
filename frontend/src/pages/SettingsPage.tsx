/**
 * Enhanced Settings Page with tabs for Profile, Security, Notifications, Account
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    User,
    Save,
    CheckCircle,
    Shield,
    Bell,
    Trash2,
    Key,
    Settings,
    LogOut,
    AlertTriangle,
    Keyboard,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';

// Schemas
const profileSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    email: z.string().email('Invalid email address'),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

type TabId = 'profile' | 'security' | 'notifications' | 'keyboard' | 'account';

interface Tab {
    id: TabId;
    label: string;
    icon: typeof User;
}

const tabs: Tab[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'keyboard', label: 'Keyboard', icon: Keyboard },
    { id: 'account', label: 'Account', icon: Settings },
];

export function SettingsPage() {
    const { user, updateUser, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<TabId>('profile');
    const [profileSuccess, setProfileSuccess] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    // Notification preferences state
    const [notifications, setNotifications] = useState({
        taskAssigned: true,
        taskUpdated: true,
        taskOverdue: true,
        emailNotifications: false,
    });

    // Delete account state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Profile form
    const profileForm = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
        },
    });

    // Password form
    const passwordForm = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const onProfileSubmit = async (data: ProfileFormData) => {
        try {
            setProfileError(null);
            setProfileSuccess(false);
            const updated = await authApi.updateProfile(data);
            updateUser(updated);
            setProfileSuccess(true);
            setTimeout(() => setProfileSuccess(false), 3000);
        } catch (err: any) {
            setProfileError(err.response?.data?.message || 'Failed to update profile');
        }
    };

    const onPasswordSubmit = async (data: PasswordFormData) => {
        try {
            setPasswordError(null);
            setPasswordSuccess(false);
            await authApi.changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
            setPasswordSuccess(true);
            passwordForm.reset();
            setTimeout(() => setPasswordSuccess(false), 3000);
        } catch (err: any) {
            setPasswordError(err.response?.data?.message || 'Failed to change password');
        }
    };

    const handleNotificationChange = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            setDeleteError('Please enter your password');
            return;
        }
        try {
            setIsDeleting(true);
            setDeleteError(null);
            await authApi.deleteAccount(deletePassword);
            logout();
        } catch (err: any) {
            setDeleteError(err.response?.data?.message || 'Failed to delete account');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <Settings className="w-7 h-7 text-indigo-400" />
                <h1 className="text-2xl font-bold text-white">Settings</h1>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardBody className="p-2">
                            <nav className="space-y-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                                            w-full flex items-center gap-3 px-4 py-3 rounded-lg
                                            text-left transition-all duration-200
                                            ${activeTab === tab.id
                                                ? 'bg-indigo-500/20 text-indigo-400 border-l-2 border-indigo-500'
                                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                            }
                                        `}
                                    >
                                        <tab.icon className="w-5 h-5" />
                                        <span className="font-medium">{tab.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </CardBody>
                    </Card>

                    {/* User Avatar Card */}
                    <Card className="mt-4">
                        <CardBody className="text-center">
                            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-medium shadow-lg">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <h3 className="mt-3 text-white font-semibold">{user?.name}</h3>
                            <p className="text-sm text-slate-400 truncate" title={user?.email}>{user?.email}</p>
                            <div className="mt-4 pt-4 border-t border-slate-700">
                                <p className="text-xs text-slate-500">
                                    Member since {user?.createdAt
                                        ? new Date(user.createdAt).toLocaleDateString()
                                        : 'N/A'}
                                </p>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <Card className="animate-fade-in">
                            <CardHeader>
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <User className="w-5 h-5 text-indigo-400" />
                                    Profile Information
                                </h2>
                                <p className="text-sm text-slate-400 mt-1">
                                    Update your account profile information
                                </p>
                            </CardHeader>
                            <CardBody>
                                {profileSuccess && (
                                    <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Profile updated successfully!
                                    </div>
                                )}
                                {profileError && (
                                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                        {profileError}
                                    </div>
                                )}

                                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                                    <Input
                                        label="Full Name"
                                        placeholder="Your name"
                                        {...profileForm.register('name')}
                                        error={profileForm.formState.errors.name?.message}
                                    />
                                    <Input
                                        type="email"
                                        label="Email Address"
                                        placeholder="your@email.com"
                                        {...profileForm.register('email')}
                                        error={profileForm.formState.errors.email?.message}
                                    />
                                    <div className="pt-4">
                                        <Button
                                            type="submit"
                                            isLoading={profileForm.formState.isSubmitting}
                                            disabled={!profileForm.formState.isDirty}
                                            leftIcon={<Save className="w-4 h-4" />}
                                        >
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            </CardBody>
                        </Card>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <Card className="animate-fade-in">
                            <CardHeader>
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-indigo-400" />
                                    Security Settings
                                </h2>
                                <p className="text-sm text-slate-400 mt-1">
                                    Manage your password and security preferences
                                </p>
                            </CardHeader>
                            <CardBody>
                                {passwordSuccess && (
                                    <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Password changed successfully!
                                    </div>
                                )}
                                {passwordError && (
                                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                        {passwordError}
                                    </div>
                                )}

                                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                                    <Input
                                        type="password"
                                        label="Current Password"
                                        placeholder="Enter current password"
                                        {...passwordForm.register('currentPassword')}
                                        error={passwordForm.formState.errors.currentPassword?.message}
                                    />
                                    <Input
                                        type="password"
                                        label="New Password"
                                        placeholder="Enter new password"
                                        {...passwordForm.register('newPassword')}
                                        error={passwordForm.formState.errors.newPassword?.message}
                                    />
                                    <Input
                                        type="password"
                                        label="Confirm New Password"
                                        placeholder="Confirm new password"
                                        {...passwordForm.register('confirmPassword')}
                                        error={passwordForm.formState.errors.confirmPassword?.message}
                                    />
                                    <div className="pt-4">
                                        <Button
                                            type="submit"
                                            isLoading={passwordForm.formState.isSubmitting}
                                            leftIcon={<Key className="w-4 h-4" />}
                                        >
                                            Change Password
                                        </Button>
                                    </div>
                                </form>

                                {/* Session Management */}
                                <div className="mt-8 pt-6 border-t border-slate-700">
                                    <h3 className="font-medium text-white mb-4">Session Management</h3>
                                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-white">Current Session</p>
                                                <p className="text-sm text-slate-400">Active now • This device</p>
                                            </div>
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <Card className="animate-fade-in">
                            <CardHeader>
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-indigo-400" />
                                    Notification Preferences
                                </h2>
                                <p className="text-sm text-slate-400 mt-1">
                                    Manage how you receive notifications
                                </p>
                            </CardHeader>
                            <CardBody className="space-y-4">
                                {/* In-App Notifications */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-medium text-slate-300">In-App Notifications</h3>

                                    <NotificationToggle
                                        label="Task Assigned"
                                        description="Get notified when a task is assigned to you"
                                        checked={notifications.taskAssigned}
                                        onChange={() => handleNotificationChange('taskAssigned')}
                                    />
                                    <NotificationToggle
                                        label="Task Updated"
                                        description="Get notified when your tasks are updated"
                                        checked={notifications.taskUpdated}
                                        onChange={() => handleNotificationChange('taskUpdated')}
                                    />
                                    <NotificationToggle
                                        label="Task Overdue"
                                        description="Get notified when tasks become overdue"
                                        checked={notifications.taskOverdue}
                                        onChange={() => handleNotificationChange('taskOverdue')}
                                    />
                                </div>

                                <div className="pt-4 border-t border-slate-700">
                                    <h3 className="text-sm font-medium text-slate-300 mb-3">Email Notifications</h3>
                                    <NotificationToggle
                                        label="Email Digest"
                                        description="Receive a daily summary of your tasks via email"
                                        checked={notifications.emailNotifications}
                                        onChange={() => handleNotificationChange('emailNotifications')}
                                    />
                                </div>

                                <div className="pt-4">
                                    <Button leftIcon={<Save className="w-4 h-4" />}>
                                        Save Preferences
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    )}

                    {/* Keyboard Shortcuts Tab */}
                    {activeTab === 'keyboard' && (
                        <Card className="animate-fade-in">
                            <CardHeader>
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Keyboard className="w-5 h-5 text-indigo-400" />
                                    Keyboard Shortcuts
                                </h2>
                                <p className="text-sm text-slate-400 mt-1">
                                    Quick navigation and actions using your keyboard
                                </p>
                            </CardHeader>
                            <CardBody className="space-y-4">
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-slate-300 mb-3">Navigation</h3>
                                    <ShortcutItem keys={['Ctrl', 'K']} description="Open Command Palette" />
                                    <ShortcutItem keys={['Alt', 'D']} description="Go to Dashboard" />
                                    <ShortcutItem keys={['Alt', 'T']} description="Go to Tasks" />
                                    <ShortcutItem keys={['Alt', ',']} description="Open Settings" />
                                </div>
                                <div className="pt-4 border-t border-slate-700 space-y-2">
                                    <h3 className="text-sm font-medium text-slate-300 mb-3">Actions</h3>
                                    <ShortcutItem keys={['Alt', 'N']} description="Create New Task" />
                                    <ShortcutItem keys={['Esc']} description="Close Modal / Cancel" />
                                    <ShortcutItem keys={['?']} description="Show Shortcuts Help" />
                                </div>
                            </CardBody>
                        </Card>
                    )}

                    {/* Account Tab */}
                    {activeTab === 'account' && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Account Info */}
                            <Card>
                                <CardHeader>
                                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Settings className="w-5 h-5 text-indigo-400" />
                                        Account Information
                                    </h2>
                                </CardHeader>
                                <CardBody>
                                    <dl className="grid grid-cols-2 gap-4">
                                        <div>
                                            <dt className="text-sm text-slate-400">User ID</dt>
                                            <dd className="text-white font-mono text-sm">{user?.id}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm text-slate-400">Account Type</dt>
                                            <dd className="text-white">Standard</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm text-slate-400">Member Since</dt>
                                            <dd className="text-white">
                                                {user?.createdAt
                                                    ? new Date(user.createdAt).toLocaleDateString()
                                                    : 'N/A'}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm text-slate-400">Status</dt>
                                            <dd className="inline-flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-green-500" />
                                                <span className="text-green-400">Active</span>
                                            </dd>
                                        </div>
                                    </dl>
                                </CardBody>
                            </Card>

                            {/* Sign Out */}
                            <Card>
                                <CardBody>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium text-white">Sign Out</h3>
                                            <p className="text-sm text-slate-400">
                                                Sign out of your account on this device
                                            </p>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            leftIcon={<LogOut className="w-4 h-4" />}
                                            onClick={logout}
                                        >
                                            Sign Out
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Danger Zone */}
                            <Card className="border-red-500/30">
                                <CardHeader>
                                    <h2 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5" />
                                        Danger Zone
                                    </h2>
                                </CardHeader>
                                <CardBody>
                                    <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                                        <div>
                                            <h3 className="font-medium text-white">Delete Account</h3>
                                            <p className="text-sm text-slate-400">
                                                Permanently delete your account and all data
                                            </p>
                                        </div>
                                        <Button
                                            variant="danger"
                                            leftIcon={<Trash2 className="w-4 h-4" />}
                                            onClick={() => setShowDeleteModal(true)}
                                        >
                                            Delete Account
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Account Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                    setDeleteError(null);
                }}
                title="Delete Account"
                size="sm"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                        <p className="text-sm text-red-400">
                            <strong>Warning:</strong> This action is permanent and cannot be undone.
                            All your tasks and data will be deleted.
                        </p>
                    </div>
                    <p className="text-slate-300">
                        Please enter your password to confirm account deletion:
                    </p>
                    <Input
                        type="password"
                        placeholder="Enter your password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        error={deleteError || undefined}
                    />
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setShowDeleteModal(false);
                                setDeletePassword('');
                                setDeleteError(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDeleteAccount}
                            isLoading={isDeleting}
                        >
                            Delete My Account
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

// Notification Toggle Component
interface NotificationToggleProps {
    label: string;
    description: string;
    checked: boolean;
    onChange: () => void;
}

function NotificationToggle({ label, description, checked, onChange }: NotificationToggleProps) {
    return (
        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
            <div>
                <p className="font-medium text-white">{label}</p>
                <p className="text-sm text-slate-400">{description}</p>
            </div>
            <button
                type="button"
                onClick={onChange}
                className={`
                    relative w-12 h-6 rounded-full transition-colors duration-200
                    ${checked ? 'bg-indigo-500' : 'bg-slate-600'}
                `}
            >
                <span
                    className={`
                        absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow
                        transition-transform duration-200
                        ${checked ? 'translate-x-6' : 'translate-x-0'}
                    `}
                />
            </button>
        </div>
    );
}

// Keyboard Shortcut Item Component
interface ShortcutItemProps {
    keys: string[];
    description: string;
}

function ShortcutItem({ keys, description }: ShortcutItemProps) {
    return (
        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <span className="text-white">{description}</span>
            <div className="flex items-center gap-1">
                {keys.map((key, i) => (
                    <span key={i}>
                        <kbd className="px-2 py-1 text-xs font-mono text-slate-300 bg-slate-700 rounded border border-slate-600">
                            {key}
                        </kbd>
                        {i < keys.length - 1 && <span className="text-slate-500 mx-1">+</span>}
                    </span>
                ))}
            </div>
        </div>
    );
}
