import React from 'react';

export default function LogoIcon({ className, size }) {
  // If size is provided, we can map it to inline styles, otherwise let tailwind handle it via className.
  const style = size ? { width: size, height: size } : {};
  return (
    <img 
      src="/logo.png" 
      alt="Swift Invoice Logo" 
      className={className} 
      style={style} 
    />
  );
}
