import React from 'react';

const Card = ({ children, className = '', padding = 'p-6' }) => {
    return (
        <div className={`bg-white border border-slate-200 rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.05)] ${padding} ${className}`}>
            {children}
        </div>
    );
};

export default Card;
