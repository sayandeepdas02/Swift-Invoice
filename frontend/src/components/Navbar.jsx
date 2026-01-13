import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
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
                        <Zap className="w-5 h-5 text-black fill-black" />
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
                            <Link to="/dashboard" className="btn-primary py-2 px-4 text-sm">
                                Dashboard
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5 text-zinc-600" />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/signin" className="text-sm font-medium text-zinc-600 hover:text-black transition-colors">
                                Sign In
                            </Link>
                            <Link to="/signup" className="btn-primary py-2.5 px-6 text-sm">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
