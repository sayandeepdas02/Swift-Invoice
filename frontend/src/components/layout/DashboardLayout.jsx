import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const DashboardLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-background flex selection:bg-brand/10">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-[240px]">
                <TopBar />
                <main className="flex-1 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
