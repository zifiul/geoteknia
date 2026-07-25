import type { ReactNode } from 'react';

import { cn } from '@/lib/shared/cn';

export type FormFieldProps = {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

export function FormField({
  id,
  label,
  hint,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-semibold text-brand-on-surface">
        {label}
        {required ? (
          <span className="text-brand-error" aria-hidden>
            {' '}
            *
          </span>
        ) : null}
        {required ? <span className="sr-only"> (obligatorio)</span> : null}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-sm text-brand-secondary">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
