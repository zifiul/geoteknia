'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/shared/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-accent !text-white hover:bg-brand-accent/90 focus-visible:ring-brand-accent',
  secondary:
    'bg-brand-neutral text-brand-on-surface hover:bg-brand-neutral/80 focus-visible:ring-brand-secondary',
  outline:
    'border border-brand-secondary/40 bg-transparent text-brand-on-surface hover:bg-brand-neutral focus-visible:ring-brand-secondary',
  ghost:
    'bg-transparent text-brand-on-surface hover:bg-brand-neutral focus-visible:ring-brand-secondary',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-11 min-w-11 px-3 py-2 text-sm',
  md: 'min-h-11 min-w-11 px-4 py-2.5 text-base',
  lg: 'min-h-11 min-w-11 px-6 py-3 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-sm font-semibold transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {loading ? (
        <>
          <span
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden
          />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
