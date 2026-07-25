'use client';

import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/shared/cn';

export type ProgressBarProps = HTMLAttributes<HTMLDivElement> & {
  value: number;
  max?: number;
  label?: string;
};

export function ProgressBar({
  value,
  max = 100,
  label = 'Progreso',
  className,
  ...props
}: ProgressBarProps) {
  const clamped = Math.min(max, Math.max(0, value));
  const percent = max > 0 ? (clamped / max) * 100 : 0;

  return (
    <div className={cn('w-full', className)} {...props}>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        className="h-2 w-full overflow-hidden rounded-full bg-brand-neutral"
      >
        <div
          className="h-full rounded-full bg-brand-accent transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
