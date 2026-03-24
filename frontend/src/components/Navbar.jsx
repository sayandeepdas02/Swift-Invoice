import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import LogoIcon from './ui/LogoIcon';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/signin');
    };

    const handleNavClick = (e, targetId) => {
        if (location.pathname === '/') {
            e.preventDefault();
            const el = document.getElementById(targetId);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
                setIsOpen(false);
            }
        }
        // If not on '/', the standard href="/#targetId" will natively navigate and jump
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-150 bg-brand-base border-b border-white/20">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between relative">
                
                {/* Continuous Vertical Grid Lines */}
                <div className="absolute inset-0 pointer-events-none hidden md:block">
                  <div className="h-full border-l border-white/20 absolute left-0" />
                  <div className="h-full border-l border-white/20 absolute right-0" />
                </div>

                {/* 1. Logo */}
                <Link to="/" className="flex items-center gap-2 group relative z-10">
                    <LogoIcon className="w-6 h-6 text-white group-hover:text-rose-200 transition-colors" strokeWidth={6} />
                    <span className="text-lg font-semibold tracking-tight text-white">Swift Invoice</span>
                </Link>

                {/* 2. Middle Links (Desktop) */}
                <div className="hidden md:flex items-center justify-center gap-8 relative z-10">
                    <a href="/#features" onClick={(e) => handleNavClick(e, 'features')} className="text-sm font-medium text-white/80 hover:text-white transition-colors tracking-tight">Features</a>
                    <a href="/#testimonials" onClick={(e) => handleNavClick(e, 'testimonials')} className="text-sm font-medium text-white/80 hover:text-white transition-colors tracking-tight">Case Studies</a>
                    <a href="/#pricing" onClick={(e) => handleNavClick(e, 'pricing')} className="text-sm font-medium text-white/80 hover:text-white transition-colors tracking-tight">Pricing</a>
                    <a href="/#blog" onClick={(e) => handleNavClick(e, 'blog')} className="text-sm font-medium text-white/80 hover:text-white transition-colors tracking-tight">Blog</a>
                </div>

                {/* 3. Right Side */}
                <div className="flex items-center gap-4 relative z-10">
                    {user ? (
                        <>
                            <span className="text-sm font-medium text-white/80 hidden sm:block tracking-tight">
                                {user.name}
                            </span>
                            <Link to="/dashboard" className="hidden md:block">
                                <Button variant="secondary" size="sm" className="shadow-none bg-white text-brand-base border-0 hover:bg-slate-50 font-semibold px-5 tracking-tight">Dashboard</Button>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="p-1.5 hover:bg-white/10 rounded text-white/80 hover:text-white transition-colors hidden md:block"
                                title="Logout"
                            >
                                <LogOut size={16} />
                            </button>
                        </>
                    ) : (
                        <div className="hidden md:flex items-center gap-4">
                            <Link to="/signin">
                                <Button variant="secondary" size="sm" className="shadow-none px-6 bg-white text-brand-base border-0 hover:bg-slate-50 font-semibold tracking-tight">Get Started</Button>
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-1.5 text-white/80 hover:bg-white/10 rounded"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <div className="md:hidden fixed inset-0 top-16 bg-brand-base z-40 p-6 flex flex-col gap-6 border-t border-rose-500/30 transition-all">
                    {user ? (
                        <>
                            <div className="flex items-center gap-3 p-4 bg-white/10 rounded border border-white/10">
                                <div className="w-8 h-8 bg-white text-brand-base rounded flex items-center justify-center font-semibold text-sm">
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-semibold text-white text-sm tracking-tight">{user.name}</div>
                                    <div className="text-xs text-white/80 tracking-tight">{user.email}</div>
                                </div>
                            </div>
                            <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-sm font-semibold p-3 border-b border-white/10 text-white tracking-tight">Dashboard</Link>
                            <Link to="/invoices" onClick={() => setIsOpen(false)} className="text-sm font-semibold p-3 border-b border-white/10 text-white tracking-tight">History</Link>
                            <button onClick={handleLogout} className="text-sm font-semibold p-3 text-left text-rose-200 hover:bg-white/10 rounded transition-colors tracking-tight">Sign Out</button>
                        </>
                    ) : (
                        <>
                            <a href="/#features" onClick={(e) => handleNavClick(e, 'features')} className="text-sm font-semibold p-3 border-b border-white/10 text-white tracking-tight">Features</a>
                            <a href="/#blog" onClick={(e) => handleNavClick(e, 'blog')} className="text-sm font-semibold p-3 border-b border-white/10 text-white tracking-tight">Blog</a>
                            <a href="/#testimonials" onClick={(e) => handleNavClick(e, 'testimonials')} className="text-sm font-semibold p-3 border-b border-white/10 text-white tracking-tight">Case Studies</a>
                            <a href="/#pricing" onClick={(e) => handleNavClick(e, 'pricing')} className="text-sm font-semibold p-3 border-b border-white/10 text-white tracking-tight">Pricing</a>
                            <Link to="/signin" onClick={() => setIsOpen(false)} className="w-full mt-4">
                                <Button variant="secondary" className="w-full bg-white text-brand-base font-semibold tracking-tight">Get Started</Button>
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
