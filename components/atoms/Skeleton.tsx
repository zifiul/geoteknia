import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/shared/cn';

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  'aria-busy'?: boolean;
};

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-busy={props['aria-busy'] ?? true}
      aria-label="Cargando"
      className={cn(
        'animate-pulse rounded-sm bg-brand-neutral',
        className,
      )}
      {...props}
    />
  );
}
