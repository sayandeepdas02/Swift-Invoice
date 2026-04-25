import React from 'react';

/**
 * GlowCard — chanhdai.com glow-card-grid pattern
 * Card with radial gradient glow on hover, brand-pink tint
 */
const GlowCard = ({ children, className = '', ...props }) => {
  return (
    <div className={`glow-card ${className}`} {...props}>
      {children}
    </div>
  );
};

export default GlowCard;
