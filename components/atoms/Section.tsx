import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/shared/cn';

export type SectionProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

export function Section({ className, children, ...props }: SectionProps) {
  return (
    <section
      className={cn('py-12 md:py-16', className)}
      {...props}
    >
      {children}
    </section>
  );
}
