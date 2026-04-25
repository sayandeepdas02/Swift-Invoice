import React from 'react';
import { Search, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TopBar = () => {
    const { user } = useAuth();

    return (
        <header className="h-16 bg-background border-b flex items-center justify-between px-8 sticky top-0 z-30" style={{ borderColor: 'var(--color-line)' }}>
            {/* Search Bar */}
            <div className="flex-1 max-w-md relative flex items-center group">
                <Search className="absolute left-3 w-4 h-4 text-muted-foreground/60 group-focus-within:text-brand transition-colors" />
                <input
                    type="text"
                    placeholder="Search invoices, clients..."
                    className="w-full pl-9 pr-4 py-1.5 text-sm bg-muted/20 border border-line text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand focus:bg-background transition-all rounded-sm"
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6">
                <button className="relative text-muted-foreground/60 hover:text-foreground transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-brand rounded-full border border-background"></span>
                </button>
                
                <div className="h-8 w-px bg-line" style={{ backgroundColor: 'var(--color-line)' }}></div>

                <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-foreground tracking-tight leading-none font-heading">{user?.name || 'User'}</span>
                        <span className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase mt-1">{user?.businessDetails?.companyName || 'Workspace'}</span>
                    </div>
                    <div className="w-9 h-9 bg-brand text-white flex items-center justify-center font-bold text-sm tracking-tighter shadow-sm rounded-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                </button>
            </div>
        </header>
    );
};

export default TopBar;
