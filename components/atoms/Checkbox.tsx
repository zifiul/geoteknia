import type { InputHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/shared/cn';

export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> & {
  label: ReactNode;
};

export function Checkbox({ label, className, id, ...props }: CheckboxProps) {
  const inputId = id ?? props.name;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        'flex min-h-11 cursor-pointer items-start gap-3 text-body-md text-brand-on-surface',
        className,
      )}
    >
      <input
        type="checkbox"
        id={inputId}
        className="mt-1 size-5 shrink-0 rounded-sm border border-brand-secondary/40 accent-brand-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-1"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
