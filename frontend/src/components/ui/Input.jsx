import React, { forwardRef } from 'react';

const Input = forwardRef(({ className = '', error, ...props }, ref) => {
    return (
        <div className="w-full relative">
            <input
                ref={ref}
                className={`w-full px-3 py-2 text-sm rounded-sm border ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-brand-base focus:ring-brand-base'} bg-white focus:outline-none focus:ring-1 transition-all duration-150 ease-in-out placeholder:text-slate-400 text-slate-900 ${className}`}
                {...props}
            />
            {error && (
                <span className="absolute -bottom-5 left-0 text-[10px] text-red-500 font-semibold tracking-tight">{error}</span>
            )}
        </div>
    );
});

Input.displayName = 'Input';
export default Input;
