'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import type { DashboardPeriod } from '@/lib/admin/dashboard-period-schema';

type Props = {
  period: DashboardPeriod;
};

const OPTIONS: { value: DashboardPeriod; label: string }[] = [
  { value: '7d', label: '7 días' },
  { value: '30d', label: '30 días' },
];

export function DashboardPeriodControl({ period }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-brand-secondary">Periodo KPI</span>
      <div
        className="inline-flex rounded-lg border border-brand-primary/15 bg-brand-surface p-0.5"
        role="group"
        aria-label="Seleccionar periodo de KPIs"
      >
        {OPTIONS.map((opt) => {
          const active = period === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              className={`min-h-11 rounded-md px-4 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary ${
                active
                  ? 'bg-brand-primary text-white'
                  : 'text-brand-primary hover:bg-brand-neutral'
              }`}
              aria-pressed={active}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('periodo', opt.value);
                router.push(`/admin?${params.toString()}`);
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
