import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '', 
  disabled = false,
  isLoading = false,
  ...props 
}) => {
  // Constraints array destroying custom pixel variables locally
  const variants = {
      primary: 'bg-brand-base text-white hover:bg-brand-hover',
      secondary: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm',
      outline: 'bg-transparent border border-slate-200 text-slate-700 hover:bg-slate-50',
      danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
      ghost: 'bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
  };

  const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
  };

  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed tracking-tight';

  return (
    <button 
      className={`${baseClasses} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
