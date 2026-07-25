import type { InputHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/shared/cn';

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: ReactNode;
};

export function Radio({ label, className, id, ...props }: RadioProps) {
  const inputId = id ?? props.name;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        'flex min-h-11 cursor-pointer items-center gap-3 text-body-md text-brand-on-surface',
        className,
      )}
    >
      <input
        type="radio"
        id={inputId}
        className="size-5 shrink-0 border border-brand-secondary/40 accent-brand-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-1"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
