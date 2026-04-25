import React from 'react';

const Card = ({ children, className = '', padding = 'p-6' }) => {
    return (
        <div className={`bg-background border border-line rounded-sm shadow-xs ${padding} ${className}`}
          style={{ borderColor: 'var(--color-line)' }}
        >
            {children}
        </div>
    );
};

export default Card;
