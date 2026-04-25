import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Button — exact chanhdai button anatomy
 *
 * Key chanhdai rules extracted from button.tsx:
 *  - h-9 default, h-8 sm, h-10 lg
 *  - rounded-lg (--radius-lg = 0.5rem)
 *  - border border-transparent bg-clip-padding
 *  - active:scale-[0.98]
 *  - focus-visible:border-ring focus-visible:ring-3 ring-ring/50
 *  - text-sm font-medium
 *  - gap-1.5 (default), gap-1 (sm)
 *  - disabled:pointer-events-none disabled:opacity-50
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'default',
  className = '',
  disabled = false,
  isLoading = false,
  ...props
}) => {
  // chanhdai variant classes
  const variants = {
    primary:     'bg-primary text-primary-foreground hover:bg-primary/80 border-transparent',
    brand:       'bg-brand text-white hover:bg-brand-hover border-transparent',
    outline:     'border-border bg-background shadow-xs hover:bg-muted hover:text-foreground',
    secondary:   'bg-secondary text-secondary-foreground hover:bg-secondary/80 border-transparent',
    ghost:       'hover:bg-muted hover:text-foreground border-transparent',
    destructive: 'bg-destructive/10 text-destructive hover:bg-destructive/20 border-transparent',
    link:        'text-primary underline-offset-3 decoration-1 hover:underline border-transparent shadow-none active:scale-100',
    // legacy aliases
    danger:      'bg-destructive/10 text-destructive hover:bg-destructive/20 border-transparent',
  };

  // chanhdai size classes — fixed height, not padding-only
  const sizes = {
    xs:      'h-6 gap-1 rounded-[min(var(--radius-lg),8px)] px-2 text-xs',
    sm:      'h-8 gap-1 rounded-[min(var(--radius-lg),10px)] px-2.5 text-sm',
    default: 'h-9 gap-1.5 px-3.5 text-sm',
    md:      'h-9 gap-1.5 px-3.5 text-sm',   // alias
    lg:      'h-10 gap-1.5 px-4 text-sm',
    icon:    'size-9 gap-0',
    'icon-sm': 'size-8 rounded-[min(var(--radius-lg),10px)] gap-0',
  };

  const base = [
    'group inline-flex shrink-0 items-center justify-center',
    'rounded-lg border bg-clip-padding',
    'font-medium whitespace-nowrap',
    'transition-[background-color,color,border-color,opacity,transform]',
    'duration-150 outline-none select-none',
    'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
    'active:scale-[0.98]',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ].join(' ');

  const variantClass = variants[variant] ?? variants.primary;
  const sizeClass    = sizes[size]    ?? sizes.default;

  return (
    <button
      className={`${base} ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
