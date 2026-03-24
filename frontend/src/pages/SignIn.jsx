import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import Button from '../components/ui/Button';

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
        <div className="w-full bg-slate-50 min-h-screen pt-16 flex font-sans selection:bg-brand-base/20 selection:text-brand-base">
            <main className="max-w-7xl mx-auto w-full border-x border-slate-200 border-t bg-white flex min-h-[calc(100vh-4rem)] relative shadow-sm">

                {/* LEFT SIDE (FORM) */}
                <div className="flex-1 flex flex-col justify-center items-center px-6 lg:px-8 py-12 relative z-10 lg:max-w-[50%] w-full">
                    <div className="w-full max-w-[420px] space-y-8">
                        <div>
                            <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">
                                Welcome back
                            </h2>
                            <p className="mt-2 text-sm text-slate-500 tracking-tight">
                                Enter your details to continue to Swift Invoice.
                            </p>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-900 tracking-tight">Email address</label>
                                <div className="relative">
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-transparent border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-base focus:ring-1 focus:ring-brand-base rounded-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-slate-900 tracking-tight">Password</label>
                                    <Link to="#" className="text-xs font-medium text-slate-500 hover:text-slate-900 hover:underline transition-colors tracking-tight">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-transparent border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-base focus:ring-1 focus:ring-brand-base rounded-none transition-colors"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-10 bg-brand-base hover:bg-brand-hover text-white flex items-center justify-center font-medium text-sm rounded-none tracking-tight transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Signing in...' : 'Sign in'}
                            </button>

                            <div className="relative flex items-center py-2">
                                <div className="flex-grow border-t border-slate-200"></div>
                                <span className="flex-shrink-0 mx-4 text-xs text-slate-400 font-medium tracking-tight uppercase">Or continue with</span>
                                <div className="flex-grow border-t border-slate-200"></div>
                            </div>

                            <button
                                type="button"
                                className="w-full h-10 bg-transparent border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center font-medium text-sm rounded-none tracking-tight transition-colors"
                            >
                                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </button>
                        </form>

                        <p className="text-sm text-slate-500 tracking-tight">
                            Don't have an account?{' '}
                            <Link to="/signup" className="font-medium text-slate-900 hover:text-brand-base hover:underline transition-colors">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>

                {/* RIGHT SIDE (VISUAL PANEL) */}
                <div className="hidden lg:flex flex-1 border-l border-slate-200 bg-slate-50 items-center justify-center relative overflow-hidden">
                    {/* Abstract Grid Background */}
                    <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>

                    {/* Image Preview Container */}
                    <div className="relative z-10 w-full max-w-[500px] flex items-center justify-center transform translate-x-8">
                        <img
                            src="/auth-preview.png"
                            alt="Swift Invoice Dashboard Preview"
                            className="w-full h-auto object-contain drop-shadow-2xl"
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SignIn;
