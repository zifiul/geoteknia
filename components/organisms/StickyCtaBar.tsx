'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/shared/cn';

export type StickyCtaBarProps = {
  children: ReactNode;
  className?: string;
};

export function StickyCtaBar({ children, className }: StickyCtaBarProps) {
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-brand-secondary/15 bg-brand-surface/95 p-4 backdrop-blur-sm md:static md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none',
        className,
      )}
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-2 sm:flex-row sm:justify-end">
        {children}
      </div>
    </div>
  );
}
