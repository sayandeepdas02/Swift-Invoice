import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/signin');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="bg-primary p-2 rounded-lg group-hover:rotate-12 transition-transform">
                        <Zap className="w-5 h-5 text-white fill-white" />
                    </div>
                    <span className="text-xl font-black tracking-tighter uppercase italic">Swift Invoice</span>
                </Link>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
                    <a href="#features" className="hover:text-black transition-colors">Features</a>
                    <a href="#testimonials" className="hover:text-black transition-colors">Testimonials</a>
                    <a href="#pricing" className="hover:text-black transition-colors">Pricing</a>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <span className="text-sm font-medium text-zinc-600 hidden sm:block">
                                {user.name}
                            </span>
                            <Link to="/invoices" className="text-sm font-medium text-zinc-600 hover:text-black transition-colors hidden md:block">
                                My Invoices
                            </Link>
                            <Link to="/dashboard" className="btn-primary py-2 px-4 text-sm hidden md:block">
                                Dashboard
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="p-2 hover:bg-zinc-100 rounded-lg transition-colors hidden md:block"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5 text-zinc-600" />
                            </button>
                        </>
                    ) : (
                        <div className="hidden md:flex items-center gap-4">
                            <Link to="/signin" className="text-sm font-medium text-zinc-600 hover:text-black transition-colors">
                                Sign In
                            </Link>
                            <Link to="/signup" className="btn-primary py-2.5 px-6 text-sm">
                                Get Started
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <div className="md:hidden fixed inset-0 top-20 bg-white z-40 p-6 flex flex-col gap-6 border-t border-zinc-100 animate-in slide-in-from-top-5">
                    {user ? (
                        <>
                            <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-xl">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold">{user.name}</div>
                                    <div className="text-xs text-zinc-500">{user.email}</div>
                                </div>
                            </div>
                            <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-lg font-medium p-2 border-b border-zinc-50">Dashboard</Link>
                            <Link to="/invoices" onClick={() => setIsOpen(false)} className="text-lg font-medium p-2 border-b border-zinc-50">My Invoices</Link>
                            <button onClick={handleLogout} className="text-lg font-medium p-2 text-left text-red-500">Sign Out</button>
                        </>
                    ) : (
                        <>
                            <Link to="/signin" onClick={() => setIsOpen(false)} className="text-lg font-medium p-2 border-b border-zinc-50">Sign In</Link>
                            <Link to="/signup" onClick={() => setIsOpen(false)} className="btn-primary py-3 text-center">Get Started</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
