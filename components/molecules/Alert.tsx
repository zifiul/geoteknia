import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/shared/cn';

export type AlertVariant = 'info' | 'success' | 'error';

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
};

const variantClasses: Record<AlertVariant, string> = {
  info: 'border-brand-info/30 bg-brand-info/10 text-brand-on-surface',
  success: 'border-brand-success/30 bg-brand-success/10 text-brand-on-surface',
  error: 'border-brand-error/30 bg-brand-error/10 text-brand-on-surface',
};

export function Alert({
  variant = 'info',
  title,
  children,
  className,
  role = 'alert',
  ...props
}: AlertProps) {
  return (
    <div
      role={role}
      className={cn(
        'rounded-md border px-4 py-3 text-body-md',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {title ? <p className="mb-1 font-semibold">{title}</p> : null}
      <div>{children}</div>
    </div>
  );
}
