import React from 'react';
import Input from '../../../components/ui/Input';

const InputField = ({ label, type = 'text', className = '', ...props }) => {
    return (
        <div className={`flex flex-col gap-1 w-full ${className}`}>
            {label && (
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {label}
                </label>
            )}
            {type === 'textarea' ? (
                <textarea
                    className="w-full px-3 py-2 text-sm rounded-sm border border-slate-200 focus:border-brand-base focus:ring-1 focus:ring-brand-base focus:outline-none transition-all duration-150 ease-in-out placeholder:text-slate-400 text-slate-900 resize-none min-h-[80px]"
                    {...props}
                />
            ) : (
                <Input type={type} className="h-10" {...props} />
            )}
        </div>
    );
};

export default InputField;
