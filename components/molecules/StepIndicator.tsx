'use client';

import { useId } from 'react';

import { cn } from '@/lib/shared/cn';

export type StepIndicatorProps = {
  /** Paso actual, 1-indexed */
  currentStep: number;
  steps: readonly string[];
  className?: string;
};

export function StepIndicator({ currentStep, steps, className }: StepIndicatorProps) {
  const liveId = useId();

  const safeStep = Math.min(Math.max(currentStep, 1), steps.length);

  return (
    <nav
      className={cn('w-full', className)}
      aria-label="Progreso del formulario"
      data-testid="step-indicator"
    >
      <p id={liveId} className="sr-only" aria-live="polite" aria-atomic="true">
        Paso {safeStep} de {steps.length}: {steps[safeStep - 1]}
      </p>
      <ol className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isComplete = stepNumber < safeStep;
          const isCurrent = stepNumber === safeStep;
          return (
            <li
              key={label}
              className={cn(
                'flex flex-1 items-center gap-2 text-sm',
                isCurrent ? 'font-semibold text-brand-on-surface' : 'text-muted',
              )}
              aria-current={isCurrent ? 'step' : undefined}
              data-testid={`step-indicator-item-${stepNumber}`}
            >
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold',
                  isCurrent && 'border-brand-accent bg-brand-accent text-white',
                  isComplete && 'border-brand-accent bg-brand-accent/15 text-brand-accent',
                  !isCurrent && !isComplete && 'border-brand-secondary/30 bg-brand-surface',
                )}
                aria-hidden="true"
              >
                {stepNumber}
              </span>
              <span className="leading-tight">{label}</span>
            </li>
          );
        })}
      </ol>
      <div
        className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-brand-secondary/15"
        role="presentation"
      >
        <div
          className="h-full rounded-full bg-brand-accent transition-[width] duration-300 ease-out"
          style={{ width: `${(safeStep / steps.length) * 100}%` }}
        />
      </div>
    </nav>
  );
}
