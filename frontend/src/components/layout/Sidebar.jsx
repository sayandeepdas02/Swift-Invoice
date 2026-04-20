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
        <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-white border-r border-slate-200 flex flex-col z-40">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-slate-200 shrink-0">
                <Link to="/dashboard" className="flex items-center gap-2 group">
                    <LogoIcon className="w-5 h-5 text-brand-base" strokeWidth={5} />
                    <span className="text-base font-bold tracking-tight text-slate-900 group-hover:text-brand-base transition-colors">Swift Invoice</span>
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
                                    ? 'bg-pink-50 text-brand-base border-r-2 border-brand-base'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-r-2 border-transparent'
                            }`}
                        >
                            <div className={`${active ? 'text-brand-base' : 'text-slate-400'}`}>
                                {link.icon}
                            </div>
                            <span className="tracking-tight">{link.label}</span>
                        </Link>
                    );
                })}
            </div>

            {/* Bottom Section */}
            <div className="p-4 border-t border-slate-200 space-y-1">
                {bottomLinks.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`flex items-center gap-3 px-3 py-2 rounded-none text-sm font-medium transition-colors ${
                            isActive(link.path)
                                ? 'bg-pink-50 text-brand-base border-r-2 border-brand-base'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-r-2 border-transparent'
                        }`}
                    >
                        <div className="text-slate-400">
                            {link.icon}
                        </div>
                        <span className="tracking-tight">{link.label}</span>
                    </Link>
                ))}
                
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-none text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-red-600 border-r-2 border-transparent transition-colors"
                >
                    <LogOut size={18} className="text-slate-400" />
                    <span className="tracking-tight">Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
