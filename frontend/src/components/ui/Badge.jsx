import React from 'react';

const Badge = ({ status, className = '' }) => {
    const normalizedStatus = status ? status.toLowerCase() : 'draft';
    
    let colorClasses = 'bg-slate-100 text-slate-600 border border-slate-200'; // Default Neutral
    
    if (normalizedStatus === 'paid') {
        colorClasses = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    } else if (['pending', 'sent', 'viewed'].includes(normalizedStatus)) {
        colorClasses = 'bg-yellow-50 text-yellow-700 border border-yellow-200';
    } else if (normalizedStatus === 'overdue') {
        colorClasses = 'bg-red-50 text-red-700 border border-red-200';
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${colorClasses} ${className}`}>
            {status || 'Draft'}
        </span>
    );
};

export default Badge;
