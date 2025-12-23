/**
 * Create User Modal
 * Admin modal for creating new users with quick preset options
 */

import { useState, useEffect } from 'react';
import { useCreateUser } from '../../hooks/useAdmin';
import { X, UserPlus, Key, Copy, Check, Shield, Users, Briefcase } from 'lucide-react';
import type { Role } from '../../types';

const ROLES: Role[] = ['USER', 'TEAM_LEAD', 'MANAGER', 'ADMIN'];

type PresetType = 'admin' | 'manager' | 'user' | 'custom';

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    preset?: PresetType;
}

function generatePassword(length = 12): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const presetConfig: Record<PresetType, { role: Role; title: string; icon: React.ElementType; color: string }> = {
    admin: { role: 'ADMIN', title: 'Invite Admin', icon: Shield, color: 'from-amber-500 to-orange-500' },
    manager: { role: 'MANAGER', title: 'Add Manager', icon: Briefcase, color: 'from-purple-500 to-indigo-500' },
    user: { role: 'USER', title: 'Add User', icon: Users, color: 'from-blue-500 to-cyan-500' },
    custom: { role: 'USER', title: 'Create New User', icon: UserPlus, color: 'from-indigo-500 to-purple-500' },
};

export function CreateUserModal({ isOpen, onClose, preset = 'custom' }: CreateUserModalProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState(generatePassword());
    const [role, setRole] = useState<Role>(presetConfig[preset].role);
    const [copied, setCopied] = useState<'password' | 'all' | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [createdUser, setCreatedUser] = useState<{ email: string; password: string } | null>(null);

    const createUser = useCreateUser();
    const config = presetConfig[preset];
    const Icon = config.icon;

    // Reset form when modal opens or preset changes
    useEffect(() => {
        if (isOpen) {
            setRole(presetConfig[preset].role);
            setPassword(generatePassword());
            setSuccess(false);
            setCreatedUser(null);
            setError('');
        }
    }, [isOpen, preset]);

    const handleGeneratePassword = () => {
        setPassword(generatePassword());
        setCopied(null);
    };

    const handleCopyPassword = () => {
        navigator.clipboard.writeText(password);
        setCopied('password');
        setTimeout(() => setCopied(null), 2000);
    };

    const handleCopyCredentials = () => {
        if (createdUser) {
            const text = `Email: ${createdUser.email}\nPassword: ${createdUser.password}`;
            navigator.clipboard.writeText(text);
            setCopied('all');
            setTimeout(() => setCopied(null), 2000);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await createUser.mutateAsync({ name, email, password, role });
            setCreatedUser({ email, password });
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create user');
        }
    };

    const handleClose = () => {
        setName('');
        setEmail('');
        setPassword(generatePassword());
        setSuccess(false);
        setCreatedUser(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fade-in">
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r ${config.color}`}>
                    <div className="flex items-center gap-2 text-white">
                        <Icon className="w-5 h-5" />
                        <h2 className="text-lg font-semibold">{config.title}</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-1 text-white/80 hover:text-white hover:bg-white/20 rounded transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {success && createdUser ? (
                    /* Success State */
                    <div className="p-6 space-y-4">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">User Created Successfully!</h3>
                            <p className="text-gray-600 text-sm mt-1">Share these credentials with the new {role.toLowerCase().replace('_', ' ')}</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Email:</span>
                                <span className="font-mono text-sm">{createdUser.email}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Password:</span>
                                <span className="font-mono text-sm">{createdUser.password}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCopyCredentials}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            {copied === 'all' ? (
                                <>
                                    <Check className="w-5 h-5" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-5 h-5" />
                                    Copy Credentials
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleClose}
                            className="w-full px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    /* Form State */
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Quick Role Presets (only show in custom mode) */}
                        {preset === 'custom' && (
                            <div className="flex gap-2 pb-2">
                                {(['admin', 'manager', 'user'] as PresetType[]).map((p) => {
                                    const pConfig = presetConfig[p];
                                    const PIcon = pConfig.icon;
                                    const isSelected = role === pConfig.role;
                                    return (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setRole(pConfig.role)}
                                            className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg border-2 transition-all text-sm ${isSelected
                                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                }`}
                                        >
                                            <PIcon className="w-4 h-4" />
                                            {p.charAt(0).toUpperCase() + p.slice(1)}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                                placeholder="john@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm text-gray-900 bg-white"
                                />
                                <button
                                    type="button"
                                    onClick={handleGeneratePassword}
                                    className="px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 border border-gray-300 rounded-lg transition-colors"
                                    title="Generate new password"
                                >
                                    <Key className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCopyPassword}
                                    className="px-3 py-2 text-gray-600 hover:text-green-600 hover:bg-green-50 border border-gray-300 rounded-lg transition-colors"
                                    title="Copy password"
                                >
                                    {copied === 'password' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {preset === 'custom' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Role
                                </label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as Role)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                                >
                                    {ROLES.map((r) => (
                                        <option key={r} value={r}>
                                            {r.replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={createUser.isPending}
                                className="flex-1 px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {createUser.isPending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4" />
                                        Create {role.replace('_', ' ')}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
