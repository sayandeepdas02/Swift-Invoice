import React from 'react';
import { Search, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TopBar = () => {
    const { user } = useAuth();

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30">
            {/* Search Bar */}
            <div className="flex-1 max-w-md relative flex items-center group">
                <Search className="absolute left-3 w-4 h-4 text-slate-400 group-focus-within:text-brand-base transition-colors" />
                <input
                    type="text"
                    placeholder="Search invoices, clients..."
                    className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-base focus:ring-1 focus:ring-brand-base focus:bg-white rounded-none transition-all"
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6">
                <button className="relative text-slate-400 hover:text-slate-900 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-brand-base rounded-full border border-white"></span>
                </button>
                
                <div className="h-6 w-px bg-slate-200"></div>

                <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-semibold text-slate-900 tracking-tight leading-none">{user?.name || 'User'}</span>
                        <span className="text-xs text-slate-500 font-medium tracking-tight mt-1">{user?.businessDetails?.companyName || 'Workspace'}</span>
                    </div>
                    <div className="w-8 h-8 bg-brand-base text-white flex items-center justify-center font-bold text-sm tracking-tighter">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                </button>
            </div>
        </header>
    );
};

export default TopBar;
