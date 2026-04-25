import React from 'react';

export function HatchSeparator({ className = "" }) {
  return (
    <div
      className={`relative flex h-8 w-full border-y border-line ${className}`}
      style={{
        borderColor: 'var(--color-line)'
      }}
    >
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(315deg, var(--pattern-foreground) 0, var(--pattern-foreground) 1px, transparent 0, transparent 50%)',
          backgroundSize: '10px 10px',
          '--pattern-foreground': 'color-mix(in oklab, var(--color-line) 56%, transparent)'
        }}
      />
    </div>
  );
}

export default HatchSeparator;
