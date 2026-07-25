import type { InputHTMLAttributes } from 'react';

import { cn } from '@/lib/shared/cn';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

const baseInput =
  'w-full rounded-sm border border-brand-secondary/30 bg-brand-surface px-3 py-2.5 text-body-md text-brand-on-surface ' +
  'placeholder:text-brand-secondary/70 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-1 ' +
  'disabled:cursor-not-allowed disabled:opacity-50 ' +
  'aria-invalid:border-brand-error aria-invalid:focus-visible:ring-brand-error';

export function Input({ className, ...props }: InputProps) {
  return <input className={cn(baseInput, className)} {...props} />;
}
