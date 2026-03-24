import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import LogoIcon from '../components/ui/LogoIcon';

const SignIn = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const success = await login(formData);
        setIsLoading(false);
        if (success) navigate('/dashboard');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-bg-base py-12 px-4 sm:px-6 lg:px-8">
            <Link to="/" className="absolute top-8 left-8 flex items-center gap-2">
                <LogoIcon className="w-6 h-6 text-brand-base" strokeWidth={6} />
                <span className="text-lg font-semibold tracking-tight text-text-primary">Swift Invoice</span>
            </Link>

            <div className="w-full max-w-[400px] space-y-6">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-semibold text-text-primary tracking-tight">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-sm text-text-secondary">
                        Welcome back to Swift Invoice
                    </p>
                </div>

                <Card className="p-8 shadow-card">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <Input
                            name="email"
                            type="email"
                            label="Email address"
                            placeholder="you@example.com"
                            icon={Mail}
                            required
                            value={formData.email}
                            onChange={handleChange}
                        />
                        
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-text-primary">Password</label>
                                <a href="#" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative flex items-center w-full">
                                <div className="absolute left-3 text-slate-400">
                                    <Lock size={16} />
                                </div>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input-field pl-9"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full mt-2"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </Button>
                    </form>
                </Card>

                <p className="text-center text-sm text-text-secondary">
                    Don't have an account?{' '}
                    <Link to="/signup" className="font-semibold text-text-primary hover:text-brand-base transition-colors">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignIn;
