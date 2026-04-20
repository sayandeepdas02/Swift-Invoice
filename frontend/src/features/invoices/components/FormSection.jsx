import React from 'react';

const FormSection = ({ title, children, className = '' }) => (
    <section className={`py-6 border-b border-slate-200 last:border-0 ${className}`}>
        {title && (
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">
                {title}
            </h3>
        )}
        <div className="flex flex-col gap-5">
            {children}
        </div>
    </section>
);

export default FormSection;
