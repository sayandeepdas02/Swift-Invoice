import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, PlusSquare, Users, Settings, HelpCircle, LogOut } from 'lucide-react';
import LogoIcon from '../ui/LogoIcon';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const { logout } = useAuth();
    
    const isActive = (path) => location.pathname === path;
    const isExactInvoice = location.pathname === '/invoices' || location.pathname.startsWith('/invoices/edit');

    const topLinks = [
        { path: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
        { path: '/invoices', icon: <FileText size={18} />, label: 'Invoices', activeCondition: isExactInvoice },
        { path: '/clients', icon: <Users size={18} />, label: 'Clients' },
        { path: '/settings', icon: <Settings size={18} />, label: 'Settings' },
    ];

    const bottomLinks = [
        { path: '/help', icon: <HelpCircle size={18} />, label: 'Help & Support' },
    ];

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-background border-r flex flex-col z-40"
            style={{ borderColor: 'var(--color-line)' }}
        >
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b shrink-0" style={{ borderColor: 'var(--color-line)' }}>
                <Link to="/dashboard" className="flex items-center gap-3 group">
                    <LogoIcon className="w-6 h-6" />
                    <span className="text-lg font-bold tracking-tighter text-foreground group-hover:text-brand transition-colors font-heading mt-0.5">
                        Swift Invoice<span className="text-brand">.</span>
                    </span>
                </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                {topLinks.map((link) => {
                    const active = link.activeCondition !== undefined ? link.activeCondition : isActive(link.path);
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center gap-3 px-3 py-2 rounded-none text-sm font-medium transition-colors ${
                                active
                                    ? 'bg-brand/5 text-brand border-r-2 border-brand font-semibold'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground border-r-2 border-transparent'
                            }`}
                        >
                            <div className={`${active ? 'text-brand' : 'text-muted-foreground/60'}`}>
                                {link.icon}
                            </div>
                            <span className="tracking-tight">{link.label}</span>
                        </Link>
                    );
                })}
            </div>

            {/* Bottom Section */}
            <div className="p-4 border-t space-y-1" style={{ borderColor: 'var(--color-line)' }}>
                {bottomLinks.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`flex items-center gap-3 px-3 py-2 rounded-none text-sm font-medium transition-colors ${
                            isActive(link.path)
                                ? 'bg-brand/5 text-brand border-r-2 border-brand font-semibold'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground border-r-2 border-transparent'
                        }`}
                    >
                        <div className="text-muted-foreground/60">
                            {link.icon}
                        </div>
                        <span className="tracking-tight">{link.label}</span>
                    </Link>
                ))}
                
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-none text-sm font-medium text-muted-foreground hover:bg-muted hover:text-destructive border-r-2 border-transparent transition-colors"
                >
                    <LogOut size={18} className="text-muted-foreground/60" />
                    <span className="tracking-tight">Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
