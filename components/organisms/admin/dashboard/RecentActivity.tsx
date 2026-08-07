import Link from 'next/link';

import type { DashboardActivityItem } from '@/lib/admin/dashboard-metrics';
import { cn } from '@/lib/shared/cn';

import { HistoryIcon } from './dashboard-icons';

type Props = {
  items: DashboardActivityItem[];
  viewAllHref?: string;
};

export function RecentActivity({ items, viewAllHref = '/admin/proyectos' }: Props) {
  return (
    <section
      aria-labelledby="activity-heading"
      className={cn(
        'flex flex-col',
        'lg:min-h-[31.25rem] lg:rounded-sm lg:border lg:border-brand-primary/15 lg:bg-brand-surface lg:shadow-sm',
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between gap-3',
          'lg:border-b lg:border-brand-primary/10 lg:bg-brand-neutral/50 lg:px-6 lg:py-4',
        )}
      >
        <h2
          id="activity-heading"
          className="flex items-center gap-2 text-lg font-bold text-brand-primary lg:text-base lg:font-semibold"
        >
          <HistoryIcon className="hidden text-brand-secondary lg:inline" />
          Actividad reciente
        </h2>
        {items.length > 0 ? (
          <Link
            href={viewAllHref}
            className="shrink-0 text-xs font-medium tracking-wide text-brand-accent uppercase hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-info lg:normal-case lg:tracking-normal"
          >
            Ver todo
          </Link>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="py-4 text-sm text-brand-secondary lg:px-6 lg:py-6">
          No hay movimientos recientes en tu ámbito.
        </p>
      ) : (
        <div className="lg:flex-1 lg:overflow-y-auto lg:p-6">
          <ol className="relative ml-3 space-y-6 border-l border-brand-primary/10 pb-2 sm:space-y-8">
            {items.map((item, index) => (
              <li key={item.id} className="relative pl-6">
                <span
                  className={cn(
                    'absolute top-1 -left-1.5 size-3 rounded-full bg-brand-surface',
                    index === 0
                      ? 'border-2 border-brand-accent'
                      : 'border-2 border-brand-primary/15',
                  )}
                  aria-hidden
                />
                <Link
                  href={item.href}
                  className="group block rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-info"
                >
                  <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-mono text-xs text-brand-secondary uppercase">
                      Proyecto
                    </span>
                    {item.meta ? (
                      <span className="rounded-sm bg-brand-accent/10 px-2 py-0.5 text-xs font-semibold text-brand-accent">
                        {item.meta}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm leading-relaxed text-brand-primary group-hover:text-brand-accent">
                    {item.title}
                  </p>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
