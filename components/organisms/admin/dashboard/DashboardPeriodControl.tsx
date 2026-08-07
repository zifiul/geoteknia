'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import type { DashboardPeriod } from '@/lib/admin/dashboard-period-schema';
import { cn } from '@/lib/shared/cn';

type Props = {
  period: DashboardPeriod;
};

const OPTIONS: { value: DashboardPeriod; label: string; shortLabel: string }[] = [
  { value: '7d', label: '7 días', shortLabel: '7 días' },
  { value: '30d', label: '30 días', shortLabel: '30 días' },
];

export function DashboardPeriodControl({ period }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="w-full sm:w-auto">
      <span className="sr-only">Periodo KPI</span>
      <div
        className="flex w-full items-center rounded-sm border border-brand-primary/15 bg-brand-surface p-1 sm:inline-flex sm:w-auto"
        role="group"
        aria-label="Seleccionar periodo de KPIs"
      >
        {OPTIONS.map((opt) => {
          const active = period === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              className={cn(
                'inline-flex min-h-11 flex-1 items-center justify-center rounded-sm px-4 text-sm font-medium transition-colors sm:flex-none sm:px-5',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-info',
                active
                  ? 'bg-brand-neutral text-brand-primary shadow-sm'
                  : 'text-brand-secondary hover:bg-brand-neutral/50',
              )}
              aria-pressed={active}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('periodo', opt.value);
                router.push(`/admin?${params.toString()}`);
              }}
            >
              <span className="sm:hidden">{opt.shortLabel}</span>
              <span className="hidden sm:inline">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
