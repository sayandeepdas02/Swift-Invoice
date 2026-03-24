import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  disabled = false,
  // size is now mostly controlled by the base classes, but we allow overrides via className
  ...props 
}) => {
  // We use the global CSS classes defined in index.css for Stripe/Linear styling
  const variantClass = 
    variant === 'primary' ? 'btn-primary' : 
    variant === 'secondary' ? 'btn-secondary' : 
    variant === 'danger' ? 'bg-danger text-white hover:bg-red-600 transition-colors duration-150 px-4 py-2 rounded-none font-medium shadow-card' :
    'bg-transparent text-text-secondary hover:text-text-primary hover:bg-slate-50 transition-colors duration-150 px-4 py-2 rounded-none font-medium'; // ghost

  return (
    <button 
      className={`${variantClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
