/**
 * Login page component
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardBody } from '../components/ui/Card';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            setError(null);
            await login(data);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to login');
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
                        <h2 className="text-2xl font-semibold text-white mb-6">Welcome back</h2>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm animate-fade-in">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div className="relative">
                                <Mail className="absolute left-3 top-[13px] w-5 h-5 text-slate-500 pointer-events-none" />
                                <Input
                                    type="email"
                                    placeholder="Email address"
                                    className="pl-11"
                                    {...register('email')}
                                    error={errors.email?.message}
                                />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-3 top-[13px] w-5 h-5 text-slate-500 pointer-events-none" />
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    className="pl-11"
                                    {...register('password')}
                                    error={errors.password?.message}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                isLoading={isSubmitting}
                                leftIcon={<LogIn className="w-5 h-5" />}
                            >
                                Sign In
                            </Button>
                        </form>

                        <p className="mt-6 text-center text-slate-400">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
                                Sign up
                            </Link>
                        </p>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
