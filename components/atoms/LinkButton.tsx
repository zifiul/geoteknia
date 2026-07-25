import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/lib/shared/cn';

export type LinkButtonVariant = 'primary' | 'secondary' | 'outline';

export type LinkButtonProps = Omit<ComponentProps<typeof Link>, 'className'> & {
  variant?: LinkButtonVariant;
  className?: string;
  children: ReactNode;
};

const variantClasses: Record<LinkButtonVariant, string> = {
  primary:
    'bg-brand-accent !text-white hover:bg-brand-accent/90 focus-visible:ring-brand-accent',
  secondary:
    'bg-brand-neutral text-brand-on-surface hover:bg-brand-neutral/80 focus-visible:ring-brand-secondary',
  outline:
    'border border-brand-secondary/40 bg-transparent text-brand-on-surface hover:bg-brand-neutral focus-visible:ring-brand-secondary',
};

export function LinkButton({
  variant = 'primary',
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={cn(
        'inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm px-4 py-2.5 text-base font-semibold transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
