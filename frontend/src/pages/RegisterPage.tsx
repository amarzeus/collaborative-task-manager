/**
 * Register page component
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardBody } from '../components/ui/Card';

const registerSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
    const navigate = useNavigate();
    const { register: registerUser } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            setError(null);
            await registerUser({
                name: data.name,
                email: data.email,
                password: data.password,
            });
            navigate('/dashboard');
        } catch (err: any) {
            // Extract specific error messages from backend validation errors
            const responseData = err.response?.data;
            if (responseData?.errors && Array.isArray(responseData.errors)) {
                // Join all field-specific error messages
                const errorMessages = responseData.errors.map((e: { message: string }) => e.message);
                setError(errorMessages.join('. '));
            } else {
                setError(responseData?.message || 'Failed to register');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold gradient-text">TaskFlow</h1>
                    <p className="text-slate-400 mt-2">Collaborative Task Management</p>
                </div>

                <Card className="backdrop-blur-xl">
                    <CardBody>
                        <h2 className="text-2xl font-semibold text-white mb-6">Create Account</h2>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm animate-fade-in">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div className="relative">
                                <User className="absolute left-3 top-[13px] w-5 h-5 text-slate-500 pointer-events-none" />
                                <Input
                                    type="text"
                                    placeholder="Full name"
                                    className="pl-11"
                                    {...register('name')}
                                    error={errors.name?.message}
                                    aria-label="Full name"
                                />
                            </div>

                            <div className="relative">
                                <Mail className="absolute left-3 top-[13px] w-5 h-5 text-slate-500 pointer-events-none" />
                                <Input
                                    type="email"
                                    placeholder="Email address"
                                    className="pl-11"
                                    {...register('email')}
                                    error={errors.email?.message}
                                    aria-label="Email address"
                                />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-3 top-[13px] w-5 h-5 text-slate-500 pointer-events-none" />
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    className="pl-11 pr-11"
                                    {...register('password')}
                                    error={errors.password?.message}
                                    aria-label="Password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-[13px] text-slate-500 hover:text-slate-300 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                                <p className="mt-1 text-xs text-slate-500">
                                    Must be 6+ characters with uppercase letter and number
                                </p>
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-3 top-[13px] w-5 h-5 text-slate-500 pointer-events-none" />
                                <Input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Confirm password"
                                    className="pl-11 pr-11"
                                    {...register('confirmPassword')}
                                    error={errors.confirmPassword?.message}
                                    aria-label="Confirm password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-[13px] text-slate-500 hover:text-slate-300 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                isLoading={isSubmitting}
                                leftIcon={<UserPlus className="w-5 h-5" />}
                            >
                                Create Account
                            </Button>
                        </form>

                        <p className="mt-6 text-center text-slate-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                                Sign in
                            </Link>
                        </p>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
