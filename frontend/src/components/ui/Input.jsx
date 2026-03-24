import React from 'react';

const Input = ({
  label,
  icon: Icon,
  error,
  className = '',
  wrapperClassName = '',
  id,
  ...props
}) => {
  const genId = id || Math.random().toString(36).substr(2, 9);
  
  return (
    <div className={`flex flex-col gap-1.5 w-full ${wrapperClassName}`}>
      {label && (
        <label htmlFor={genId} className="text-sm font-semibold text-text-primary">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {Icon && (
          <div className="absolute left-3 text-slate-400">
            <Icon size={16} />
          </div>
        )}
        <input
          id={genId}
          className={`input-field ${Icon ? 'pl-9' : ''} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-red-500 font-medium mt-0.5">{error}</span>}
    </div>
  );
};

export default Input;
