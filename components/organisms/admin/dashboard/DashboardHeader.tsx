import Link from 'next/link';
import { Suspense } from 'react';

import type { DashboardPeriod } from '@/lib/admin/dashboard-period-schema';
import { cn } from '@/lib/shared/cn';

import { DashboardPeriodControl } from './DashboardPeriodControl';
import { AddIcon, DownloadIcon } from './dashboard-icons';

type Props = {
  period: DashboardPeriod;
  showNewProject?: boolean;
};

export function DashboardHeader({ period, showNewProject = true }: Props) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
      <div className="min-w-0 space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-primary lg:text-headline-sm">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-brand-secondary">
            Resumen operativo y alertas del sistema de gestión técnica.
          </p>
        </div>
        <Suspense fallback={null}>
          <DashboardPeriodControl period={period} />
        </Suspense>
      </div>

      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-3">
        <button
          type="button"
          disabled
          aria-disabled="true"
          title="Exportación de informes disponible próximamente"
          className={cn(
            'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-sm border border-brand-primary/15 bg-brand-surface px-4 text-sm font-medium text-brand-primary shadow-sm',
            'opacity-60 sm:w-auto',
          )}
        >
          <DownloadIcon />
          <span>Exportar reporte</span>
        </button>
        {showNewProject ? (
          <Link
            href="/admin/proyectos"
            className={cn(
              'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-sm bg-brand-accent px-4 text-sm font-medium text-white shadow-sm transition-colors',
              'hover:bg-brand-accent/90 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-info',
              'sm:w-auto',
            )}
          >
            <AddIcon />
            <span>Nuevo proyecto</span>
          </Link>
        ) : null}
      </div>
    </header>
  );
}
