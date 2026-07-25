import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/shared/cn';

export type FieldErrorProps = HTMLAttributes<HTMLParagraphElement> & {
  id: string;
  children?: ReactNode;
};

export function FieldError({ id, className, children, ...props }: FieldErrorProps) {
  if (!children) {
    return null;
  }

  return (
    <p
      id={id}
      role="alert"
      className={cn('text-sm text-brand-error', className)}
      {...props}
    >
      {children}
    </p>
  );
}
