import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/shared/cn';

export type GridProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
};

const colClasses: Record<NonNullable<GridProps['cols']>, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

export function Grid({ cols = 1, className, children, ...props }: GridProps) {
  return (
    <div
      className={cn('grid gap-4 md:gap-6', colClasses[cols], className)}
      {...props}
    >
      {children}
    </div>
  );
}
