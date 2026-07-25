'use client';

import { cn } from '@/lib/shared/cn';

type ConsentToggleProps = {
  id: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  'aria-label': string;
};

/** Interruptor alineado con Stitch (GTK-46). */
export function ConsentToggle({
  id,
  checked,
  disabled = false,
  onChange,
  'aria-label': ariaLabel,
}: ConsentToggleProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'relative inline-flex h-6 w-12 shrink-0 items-center',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
      )}
    >
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => onChange?.(e.target.checked)}
        className="peer sr-only"
      />
      <span
        className={cn(
          'absolute inset-0 rounded-full border border-brand-secondary/25 bg-brand-neutral',
          'peer-checked:bg-brand-accent peer-focus-visible:ring-2 peer-focus-visible:ring-brand-accent',
          'transition-colors duration-200',
        )}
        aria-hidden
      />
      <span
        className={cn(
          'pointer-events-none absolute left-0.5 size-5 rounded-full bg-brand-surface shadow-sm',
          'transition-transform duration-200 peer-checked:translate-x-6',
        )}
        aria-hidden
      />
    </label>
  );
}
