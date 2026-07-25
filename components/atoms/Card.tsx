import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/shared/cn';

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-md border border-brand-secondary/15 bg-brand-surface p-4 shadow-card',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
