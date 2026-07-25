import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/shared/cn';

export type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Container({ className, children, ...props }: ContainerProps) {
  return (
    <div
      className={cn('mx-auto w-full max-w-[1200px] px-4 md:px-6', className)}
      {...props}
    >
      {children}
    </div>
  );
}
