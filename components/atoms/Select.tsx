import type { SelectHTMLAttributes } from 'react';

import { cn } from '@/lib/shared/cn';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

const baseSelect =
  'w-full rounded-sm border border-brand-secondary/30 bg-brand-surface px-3 py-2.5 text-body-md text-brand-on-surface ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-1 ' +
  'disabled:cursor-not-allowed disabled:opacity-50 ' +
  'aria-invalid:border-brand-error';

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select className={cn(baseSelect, className)} {...props}>
      {children}
    </select>
  );
}
